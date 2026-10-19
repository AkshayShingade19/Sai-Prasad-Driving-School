import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DemoBooking, DemoBookingDocument, DemoStatus } from './schemas/demo-booking.schema';
import { CreateDemoBookingDto, DemoBookingQueryDto, UpdateDemoBookingDto } from './dto/demo-booking.dto';
import { StudentStatus } from '../students/schemas/student.schema';

@Injectable()
export class DemoBookingsService {
  constructor(
    @InjectModel(DemoBooking.name) private demoBookingModel: Model<DemoBookingDocument>,
  ) {}

  // Public: submit a demo booking request
  async create(dto: CreateDemoBookingDto) {
    if (!dto.consent) {
      throw new BadRequestException('Consent is required to submit a booking');
    }

    const booking = await this.demoBookingModel.create({
      name: dto.name,
      mobile: dto.mobile,
      email: dto.email || '',
      preferredDate: dto.preferredDate || '',
      preferredTime: dto.preferredTime || '',
      course: dto.course || '',
      experience: dto.experience || 'beginner',
      contactMethod: dto.contactMethod || 'phone',
      message: dto.message || '',
      status: DemoStatus.NEW,
      consent: true,
    });

    return {
      message: 'Thank you! Your demo booking request has been received. We will contact you shortly.',
      booking,
    };
  }

  async findAll(query: DemoBookingQueryDto) {
    const filter: any = {};

    if (query.search) {
      const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: searchRegex }, { mobile: searchRegex }, { email: searchRegex }];
    }
    if (query.status) filter.status = query.status;

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.demoBookingModel
        .find(filter)
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.demoBookingModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const booking = await this.demoBookingModel
      .findById(id)
      .populate('assignedTo', 'name')
      .populate('convertedToStudent', 'name studentId mobile');
    if (!booking) throw new NotFoundException('Demo booking not found');
    return booking;
  }

  async update(id: string, dto: UpdateDemoBookingDto) {
    const booking = await this.demoBookingModel.findById(id);
    if (!booking) throw new NotFoundException('Demo booking not found');

    Object.assign(booking, dto);
    await booking.save();
    return booking;
  }

  async remove(id: string) {
    const booking = await this.demoBookingModel.findByIdAndDelete(id);
    if (!booking) throw new NotFoundException('Demo booking not found');
    return { message: 'Demo booking deleted' };
  }

  // Convert demo booking to student
  async convertToStudent(id: string, studentData: any) {
    const booking = await this.demoBookingModel.findById(id);
    if (!booking) throw new NotFoundException('Demo booking not found');
    if (booking.status === DemoStatus.CONVERTED) {
      throw new BadRequestException('This booking has already been converted');
    }

    const Student = this.demoBookingModel.db.model('Student');
    const year = new Date().getFullYear();
    const count = await Student.countDocuments({ studentId: { $regex: `^SPD-${year}-` } });
    const studentId = `SPD-${year}-${String(count + 1).padStart(4, '0')}`;

    const student = await Student.create({
      studentId,
      name: booking.name,
      mobile: booking.mobile,
      email: booking.email || '',
      course: studentData.course,
      instructor: studentData.instructor,
      startDate: studentData.startDate || new Date(),
      plannedLessons: studentData.plannedLessons || 0,
      courseFee: studentData.courseFee || 0,
      amountPaid: studentData.amountPaid || 0,
      status: StudentStatus.ACTIVE,
      transmission: studentData.transmission || 'manual',
      notes: `Converted from demo booking. Original course interest: ${booking.course}`,
    });

    booking.status = DemoStatus.CONVERTED;
    booking.convertedToStudent = student._id;
    booking.outcome = 'Converted to student';
    await booking.save();

    return { student, booking };
  }

  // Dashboard stats
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, newToday, scheduled, converted] = await Promise.all([
      this.demoBookingModel.countDocuments({ status: { $in: [DemoStatus.NEW, DemoStatus.CONTACTED] } }),
      this.demoBookingModel.countDocuments({ createdAt: { $gte: today } }),
      this.demoBookingModel.countDocuments({ status: DemoStatus.DEMO_SCHEDULED }),
      this.demoBookingModel.countDocuments({ status: DemoStatus.CONVERTED }),
    ]);

    return { pending, newToday, scheduled, converted };
  }

  // Get upcoming demos
  async getUpcomingDemos() {
    return this.demoBookingModel
      .find({
        status: DemoStatus.DEMO_SCHEDULED,
        demoDate: { $gte: new Date() },
      })
      .populate('assignedTo', 'name')
      .sort({ demoDate: 1 })
      .limit(10);
  }
}

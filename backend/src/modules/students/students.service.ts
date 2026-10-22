import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Student, StudentDocument, StudentStatus } from './schemas/student.schema';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
import { Role } from '../auth/roles.enum';
import { businessDayRange } from '../../common/timezone.util';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  private async generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.studentModel.countDocuments({
      studentId: { $regex: `^SPD-${year}-` },
    });
    return `SPD-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(query: StudentQueryDto, userRole: Role, userId: string) {
    const filter: any = { isArchived: false };

    // Instructors can only see their own students
    if (userRole === Role.INSTRUCTOR) {
      filter.instructor = new Types.ObjectId(userId);
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: searchRegex }, { mobile: searchRegex }];
    }
    if (query.course) filter.course = new Types.ObjectId(query.course);
    if (query.instructor) filter.instructor = new Types.ObjectId(query.instructor);
    if (query.status) filter.status = query.status;

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .populate('course', 'name price sessions')
        .populate('instructor', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userRole: Role, userId: string) {
    const student = await this.studentModel
      .findById(id)
      .populate('course')
      .populate('instructor', 'name phone email')
      .lean();

    if (!student) throw new NotFoundException('Student not found');

    if (userRole === Role.INSTRUCTOR && String(student.instructor?._id) !== userId) {
      throw new ForbiddenException('You can only view your own students');
    }

    return student;
  }

  async create(dto: CreateStudentDto) {
    // Check for duplicate mobile
    const existing = await this.studentModel.findOne({ mobile: dto.mobile, isArchived: false });
    if (existing) {
      throw new BadRequestException(`Student with mobile ${dto.mobile} already exists`);
    }

    const studentId = await this.generateStudentId();

    // Portal login credentials
    const plainPassword = dto.password || this.generateDefaultPassword(dto.mobile);
    const hashedPassword = plainPassword ? await bcrypt.hash(plainPassword, 12) : '';

    // Calculate planned end date from course if not provided
    let plannedEndDate = (dto as any).plannedEndDate;
    if (!plannedEndDate && dto.course) {
      const Course = this.studentModel.db.model('Course');
      const course = await Course.findById(dto.course).lean() as any;
      if (course) {
        plannedEndDate = new Date(dto.startDate || new Date());
        plannedEndDate.setDate(plannedEndDate.getDate() + (course.durationWeeks || 4) * 7);
      }
    }

    const student = await this.studentModel.create({
      studentId,
      name: dto.name,
      mobile: dto.mobile,
      email: dto.email || '',
      address: dto.address || '',
      emergencyContact: dto.emergencyContact || '',
      course: dto.course,
      instructor: dto.instructor,
      startDate: dto.startDate || new Date(),
      plannedEndDate,
      plannedLessons: dto.plannedLessons || 0,
      completedLessons: 0,
      courseFee: dto.courseFee || 0,
      amountPaid: dto.amountPaid || 0,
      status: dto.status || StudentStatus.ACTIVE,
      transmission: dto.transmission || 'manual',
      notes: dto.notes || '',
      password: hashedPassword,
      isActive: true,
    });

    const result = student.toObject();
    const { password, ...rest } = result;

    return {
      ...rest,
      // Plain password returned once so the admin can share it with the student
      portalPassword: plainPassword || null,
    };
  }

  /** Default portal password derived from the mobile number, e.g. Sai@1234 */
  private generateDefaultPassword(mobile: string): string {
    const digits = (mobile || '').replace(/\D/g, '');
    const tail = digits.slice(-4).padStart(4, '0');
    return `Sai@${tail}`;
  }

  /** Reset a student's portal password (admin action) */
  async resetPassword(id: string, newPassword?: string) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    const plain = newPassword || this.generateDefaultPassword(student.mobile);
    student.password = await bcrypt.hash(plain, 12);
    await student.save();
    return { message: 'Password reset successfully', portalPassword: plain };
  }

  /** Get current portal credential status (never returns the password) */
  async getPortalCredentials(id: string) {
    const student = await this.studentModel
      .findById(id)
      .select('+password')
      .lean();

    if (!student) throw new NotFoundException('Student not found');

    return {
      studentId: student.studentId,
      name: student.name,
      mobile: student.mobile,
      email: student.email || '',
      hasPassword: !!student.password,
      isActive: student.isActive,
      suggestedPassword: this.generateDefaultPassword(student.mobile),
    };
  }

  /** Set the student's portal username (email) and/or password */
  async setPortalCredentials(
    id: string,
    body: { email?: string; password?: string; isActive?: boolean },
  ) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    if (body.email !== undefined) {
      const email = (body.email || '').trim().toLowerCase();
      if (email) {
        const duplicate = await this.studentModel.findOne({
          email,
          _id: { $ne: id },
        });
        if (duplicate) {
          throw new BadRequestException(
            'Another student is already using this email address',
          );
        }
        student.email = email;
      } else {
        student.email = '';
      }
    }

    if (body.isActive !== undefined) {
      student.isActive = body.isActive;
    }

    // Always (re)set the password so a fresh copy can be printed
    const plain = (body.password || '').trim() || this.generateDefaultPassword(student.mobile);
    student.password = await bcrypt.hash(plain, 12);
    student.isActive = true;

    await student.save();

    return {
      message: 'Portal credentials updated',
      studentId: student.studentId,
      name: student.name,
      mobile: student.mobile,
      email: student.email,
      portalPassword: plain,
    };
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    // Check for mobile uniqueness if mobile changed
    if (dto.mobile && dto.mobile !== student.mobile) {
      const existing = await this.studentModel.findOne({
        mobile: dto.mobile,
        _id: { $ne: id },
        isArchived: false,
      });
      if (existing) {
        throw new BadRequestException(`Mobile ${dto.mobile} is already registered`);
      }
    }

    // If plannedLessons decreased below completedLessons, clamp completedLessons
    if (dto.plannedLessons !== undefined && dto.plannedLessons < student.completedLessons) {
      dto.completedLessons = dto.plannedLessons;
    }

    Object.assign(student, dto);
    await student.save();
    return student.populate('course instructor');
  }

  async archive(id: string) {
    const student = await this.studentModel.findByIdAndUpdate(id, { isArchived: true });
    if (!student) throw new NotFoundException('Student not found');
    return { message: 'Student archived' };
  }

  // Dashboard statistics
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, activeStudents, newThisMonth, byStatus] = await Promise.all([
      this.studentModel.countDocuments({ isArchived: false }),
      this.studentModel.countDocuments({ status: StudentStatus.ACTIVE, isArchived: false }),
      this.studentModel.countDocuments({
        createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) },
        isArchived: false,
      }),
      this.studentModel.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts: Record<string, number> = {};
    byStatus.forEach((s: any) => { statusCounts[s._id] = s.count; });

    return {
      totalStudents,
      activeStudents,
      newThisMonth,
      byStatus: statusCounts,
    };
  }

  // Get students for attendance sheet (scheduled on a given date)
  async getScheduledStudents(date: Date, instructorId?: string, courseId?: string) {
    const { start, end } = businessDayRange(date);

    // Find lessons scheduled on this business day
    const Lesson = this.studentModel.db.model('Lesson');
    const lessonFilter: any = {
      date: { $gte: start, $lte: end },
      status: { $in: ['scheduled', 'in_progress'] },
    };
    if (instructorId) lessonFilter.instructor = new Types.ObjectId(instructorId);
    if (courseId) lessonFilter.course = new Types.ObjectId(courseId);

    const lessons = await Lesson.find(lessonFilter).populate('student').populate('course').lean();

    return lessons.map((lesson) => ({
      studentId: lesson.student?._id,
      studentName: lesson.student?.name,
      studentMobile: lesson.student?.mobile,
      studentDbId: lesson.student?.studentId,
      course: lesson.course?.name || '',
      courseId: lesson.course?._id,
      instructorId: lesson.instructor?._id,
      instructorName: lesson.instructor?.name || '',
      scheduledTime: lesson.startTime,
      duration: lesson.duration,
      lessonId: lesson._id,
      status: lesson.status,
    }));
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Student, StudentDocument, StudentStatus } from '../students/schemas/student.schema';
import { StudentLoginDto } from '../auth/dto/student-login.dto';
import { StudentChangePasswordDto } from './dto/student-change-password.dto';
import { businessDateString } from '../../common/timezone.util';

@Injectable()
export class StudentPortalService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private jwtService: JwtService,
  ) {}

  async login(dto: StudentLoginDto) {
    const student = await this.studentModel
      .findOne({ email: dto.email.toLowerCase().trim() })
      .select('+password');

    if (!student || !student.password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!student.isActive) {
      throw new UnauthorizedException('Your account is inactive. Please contact the driving school.');
    }
    if (student.isArchived) {
      throw new UnauthorizedException('Your account is no longer active.');
    }

    const isMatch = await bcrypt.compare(dto.password, student.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: student._id.toString(),
      email: student.email,
      name: student.name,
      type: 'student' as const,
    };
    const accessToken = this.jwtService.sign(payload);

    student.lastLoginAt = new Date();
    await student.save();

    return {
      accessToken,
      student: {
        id: student._id.toString(),
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
      },
    };
  }

  private async findStudent(id: string) {
    const student = await this.studentModel
      .findById(id)
      .populate('course', 'name sessions price durationWeeks')
      .populate('instructor', 'name phone')
      .lean();
    if (!student) throw new NotFoundException('Student not found');
    return student as any;
  }

  /** Profile + course + instructor */
  async getProfile(studentId: string) {
    const student = await this.findStudent(studentId);
    return {
      id: student._id.toString(),
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      status: student.status,
      course: student.course || null,
      instructor: student.instructor || null,
      startDate: student.startDate,
      plannedEndDate: student.plannedEndDate,
      plannedLessons: student.plannedLessons,
      completedLessons: student.completedLessons,
      courseFee: student.courseFee,
      amountPaid: student.amountPaid,
      transmission: student.transmission,
      isActive: student.isActive,
    };
  }

  /** Attendance history + summary for the logged-in student */
  async getAttendance(studentId: string) {
    const Attendance = this.studentModel.db.model('Attendance');
    const records = await Attendance.find({ student: new Types.ObjectId(studentId), isDeleted: false })
      .populate('instructor', 'name')
      .populate('course', 'name')
      .sort({ date: -1 })
      .lean();

    const present = records.filter((r: any) => r.status === 'present').length;
    const late = records.filter((r: any) => r.status === 'late').length;
    const absent = records.filter((r: any) => r.status === 'absent').length;
    const excused = records.filter((r: any) => r.status === 'excused').length;
    const rescheduled = records.filter((r: any) => r.status === 'rescheduled').length;

    // Eligible = present + late + absent (excused & rescheduled are excluded)
    const eligible = present + late + absent;
    const percentage = eligible > 0 ? Math.round(((present + late) / eligible) * 100) : 0;

    return {
      records: records.map((r: any) => ({
        id: r._id.toString(),
        date: r.date,
        scheduledTime: r.scheduledTime,
        status: r.status,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        duration: r.duration,
        remarks: r.remarks,
        instructor: r.instructor?.name || '',
        course: r.course?.name || '',
      })),
      summary: {
        totalScheduled: records.length,
        present,
        late,
        absent,
        excused,
        rescheduled,
        eligibleLessons: eligible,
        attendancePercentage: percentage,
        lessonsRemaining: Math.max(
          0,
          (await this.plannedLessonCount(studentId)) - present - late,
        ),
      },
    };
  }

  private async plannedLessonCount(studentId: string): Promise<number> {
    const student = await this.studentModel.findById(studentId).lean();
    return (student as any)?.plannedLessons || 0;
  }

  /** Upcoming and past lessons for the logged-in student */
  async getLessons(studentId: string) {
    const Lesson = this.studentModel.db.model('Lesson');
    const lessons = await Lesson.find({ student: new Types.ObjectId(studentId) })
      .populate('instructor', 'name')
      .populate('course', 'name')
      .sort({ date: -1 })
      .limit(100)
      .lean();

    return lessons.map((l: any) => ({
      id: l._id.toString(),
      date: l.date,
      startTime: l.startTime,
      duration: l.duration,
      status: l.status,
      instructor: l.instructor?.name || '',
      course: l.course?.name || '',
      transmission: l.transmission,
      notes: l.notes,
    }));
  }

  /** Payment history + balance */
  async getPayments(studentId: string) {
    const Payment = this.studentModel.db.model('Payment');
    const student = await this.studentModel.findById(studentId).lean();

    const payments = await Payment.find({ student: new Types.ObjectId(studentId), isDeleted: false })
      .sort({ paymentDate: -1 })
      .lean();

    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const courseFee = (student as any)?.courseFee || 0;

    return {
      payments: payments.map((p: any) => ({
        id: p._id.toString(),
        amount: p.amount,
        paymentDate: p.paymentDate,
        method: p.method,
        transactionRef: p.transactionRef,
        notes: p.notes,
      })),
      totalPaid,
      courseFee,
      balance: courseFee - totalPaid,
    };
  }

  /** Everything the portal dashboard needs in one call */
  async getDashboard(studentId: string) {
    const [profile, attendance, lessons, payments] = await Promise.all([
      this.getProfile(studentId),
      this.getAttendance(studentId),
      this.getLessons(studentId),
      this.getPayments(studentId),
    ]);

    const today = businessDateString(new Date());
    const upcoming = lessons.filter(
      (l: any) => businessDateString(l.date) >= today && l.status === 'scheduled',
    );

    return {
      profile,
      summary: attendance.summary,
      upcomingLessons: upcoming.slice(0, 5),
      totalLessons: lessons.length,
      payments: { totalPaid: payments.totalPaid, balance: payments.balance, courseFee: payments.courseFee },
    };
  }

  async changePassword(studentId: string, dto: StudentChangePasswordDto) {
    const student = await this.studentModel.findById(studentId).select('+password');
    if (!student) throw new NotFoundException('Student not found');

    if (!student.password) {
      throw new BadRequestException('No portal password set. Please contact the driving school.');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, student.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    student.password = await bcrypt.hash(dto.newPassword, 12);
    await student.save();
    return { message: 'Password changed successfully' };
  }
}

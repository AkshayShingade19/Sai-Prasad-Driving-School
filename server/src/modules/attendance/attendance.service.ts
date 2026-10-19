import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument, AttendanceStatus } from './schemas/attendance.schema';
import { AttendanceQueryDto, BulkMarkAttendanceDto, MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { Role } from '../auth/roles.enum';
import { businessDayRange, businessDayFromString } from '../../common/timezone.util';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  /**
   * Mark attendance for a lesson
   */
  async markAttendance(dto: MarkAttendanceDto, userId: string) {
    const Lesson = this.attendanceModel.db.model('Lesson');
    const lesson = await Lesson.findById(dto.lessonId);
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Check for existing attendance record
    const existing = await this.attendanceModel.findOne({
      lesson: new Types.ObjectId(dto.lessonId),
      isDeleted: false,
    });

    if (existing) {
      throw new ConflictException(
        'Attendance already marked for this lesson. Use update to correct.',
      );
    }

    const attendance = await this.attendanceModel.create({
      student: lesson.student,
      instructor: lesson.instructor,
      lesson: lesson._id,
      course: lesson.course,
      date: lesson.date,
      scheduledTime: lesson.startTime,
      status: dto.status,
      checkInTime: dto.checkInTime || null,
      checkOutTime: dto.checkOutTime || null,
      duration: dto.duration || lesson.duration,
      remarks: dto.remarks || '',
      markedBy: new Types.ObjectId(userId),
      markedAt: new Date(),
    });

    // Link attendance to lesson
    await Lesson.findByIdAndUpdate(dto.lessonId, {
      attendanceId: attendance._id,
    });

    return attendance;
  }

  /**
   * Bulk mark attendance for multiple lessons
   */
  async bulkMarkAttendance(dto: BulkMarkAttendanceDto, userId: string) {
    const results: { success: any[]; errors: any[] } = { success: [], errors: [] };

    for (const record of dto.records) {
      try {
        const attendance = await this.markAttendance(record, userId);
        results.success.push(attendance);
      } catch (error: any) {
        results.errors.push({
          lessonId: record.lessonId,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Update/correct attendance
   */
  async updateAttendance(id: string, dto: UpdateAttendanceDto, userId: string) {
    const attendance = await this.attendanceModel.findById(id);
    if (!attendance) throw new NotFoundException('Attendance record not found');

    // Store previous values for audit
    const previousValues = {
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      duration: attendance.duration,
      remarks: attendance.remarks,
    };

    Object.assign(attendance, dto);
    attendance.editedBy = new Types.ObjectId(userId);
    attendance.editedAt = new Date();

    await attendance.save();

    // Log the correction
    const AuditLog = this.attendanceModel.db.model('AuditLog');
    await AuditLog.create({
      action: 'attendance_corrected',
      entityType: 'Attendance',
      entityId: attendance._id,
      performedBy: new Types.ObjectId(userId),
      previousValues,
      newValues: {
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        duration: attendance.duration,
        remarks: attendance.remarks,
      },
    });

    return attendance;
  }

  /**
   * Get daily attendance sheet
   */
  async getDailyAttendance(date: string, instructorId?: string, courseId?: string) {
    const { start, end } = businessDayFromString(date);

    const filter: any = {
      date: { $gte: start, $lte: end },
      isDeleted: false,
    };

    if (instructorId) filter.instructor = new Types.ObjectId(instructorId);
    if (courseId) filter.course = new Types.ObjectId(courseId);

    return this.attendanceModel
      .find(filter)
      .populate('student', 'name mobile studentId')
      .populate('instructor', 'name')
      .populate('course', 'name')
      .sort({ scheduledTime: 1 });
  }

  /**
   * Get student attendance history
   */
  async getStudentAttendance(studentId: string) {
    const records = await this.attendanceModel
      .find({ student: new Types.ObjectId(studentId), isDeleted: false })
      .populate('instructor', 'name')
      .populate('course', 'name')
      .populate('lesson')
      .sort({ date: -1 });

    // Calculate summary
    const totalScheduled = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const excused = records.filter((r) => r.status === AttendanceStatus.EXCUSED).length;
    const rescheduled = records.filter((r) => r.status === AttendanceStatus.RESCHEDULED).length;

    // Eligible lessons = present + late + absent (exclude excused and rescheduled)
    const eligibleLessons = present + late + absent;
    const attendancePercentage = eligibleLessons > 0
      ? Math.round(((present + late) / eligibleLessons) * 100)
      : 0;

    return {
      records,
      summary: {
        totalScheduled,
        present,
        late,
        absent,
        excused,
        rescheduled,
        eligibleLessons,
        attendancePercentage,
      },
    };
  }

  /**
   * Get attendance with filters and pagination
   */
  async findAll(query: AttendanceQueryDto, userRole: Role, userId: string) {
    const filter: any = { isDeleted: false };

    if (userRole === Role.INSTRUCTOR) {
      filter.instructor = new Types.ObjectId(userId);
    }

    if (query.date) {
      const { start, end } = businessDayFromString(query.date);
      filter.date = { $gte: start, $lte: end };
    } else if (query.startDate && query.endDate) {
      filter.date = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    if (query.instructor) filter.instructor = new Types.ObjectId(query.instructor);
    if (query.course) filter.course = new Types.ObjectId(query.course);
    if (query.student) filter.student = new Types.ObjectId(query.student);
    if (query.status) filter.status = query.status;

    return this.attendanceModel
      .find(filter)
      .populate('student', 'name mobile studentId')
      .populate('instructor', 'name')
      .populate('course', 'name')
      .sort({ date: -1, scheduledTime: 1 })
      .limit(500);
  }

  /**
   * Get attendance summary for dashboard
   */
  async getTodaySummary() {
    const { start, end } = businessDayRange();

    const records = await this.attendanceModel.find({
      date: { $gte: start, $lte: end },
      isDeleted: false,
    });

    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const excused = records.filter((r) => r.status === AttendanceStatus.EXCUSED).length;
    const rescheduled = records.filter((r) => r.status === AttendanceStatus.RESCHEDULED).length;

    return {
      total: records.length,
      present,
      late,
      absent,
      excused,
      rescheduled,
    };
  }

  /**
   * Export attendance as CSV
   */
  async exportCSV(query: AttendanceQueryDto): Promise<string> {
    const records = await this.findAll(query, Role.ADMIN, '');

    const headers = [
      'Date',
      'Student ID',
      'Student Name',
      'Course',
      'Instructor',
      'Scheduled Time',
      'Status',
      'Check-in Time',
      'Check-out Time',
      'Duration (min)',
      'Remarks',
    ];

    const rows = (records as any[]).map((r) => [
      r.date.toISOString().split('T')[0],
      r.student?.studentId || '',
      r.student?.name || '',
      r.course?.name || '',
      r.instructor?.name || '',
      r.scheduledTime,
      r.status,
      r.checkInTime ? r.checkInTime.toISOString() : '',
      r.checkOutTime ? r.checkOutTime.toISOString() : '',
      r.duration,
      r.remarks || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Get monthly summary for an instructor
   */
  async getInstructorMonthlySummary(instructorId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await this.attendanceModel.find({
      instructor: new Types.ObjectId(instructorId),
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false,
    }).populate('student', 'name studentId');

    const byStudent: Record<string, any> = {};
    records.forEach((r: any) => {
      const s = r.student as any;
      const sid = (s._id || s).toString();
      if (!byStudent[sid]) {
        byStudent[sid] = {
          studentName: s.name || '',
          studentId: s.studentId || '',
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
        };
      }
      byStudent[sid].total++;
      if (r.status === AttendanceStatus.PRESENT) byStudent[sid].present++;
      if (r.status === AttendanceStatus.LATE) byStudent[sid].late++;
      if (r.status === AttendanceStatus.ABSENT) byStudent[sid].absent++;
      if (r.status === AttendanceStatus.EXCUSED) byStudent[sid].excused++;
    });

    return Object.values(byStudent);
  }

  /**
   * Get students with frequent absences
   */
  async getFrequentAbsences(threshold: number = 3) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.attendanceModel.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
          status: AttendanceStatus.ABSENT,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$student',
          absenceCount: { $sum: 1 },
        },
      },
      {
        $match: { absenceCount: { $gte: threshold } },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentData',
        },
      },
      { $unwind: '$studentData' },
      {
        $project: {
          studentId: '$studentData.studentId',
          name: '$studentData.name',
          mobile: '$studentData.mobile',
          absenceCount: 1,
        },
      },
    ]).exec();
  }
}

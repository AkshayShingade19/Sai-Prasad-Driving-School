import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument, LessonStatus } from './schemas/lesson.schema';
import { CreateLessonDto, LessonQueryDto, RescheduleLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { Role } from '../auth/roles.enum';
import { businessDayRange } from '../../common/timezone.util';

@Injectable()
export class LessonsService {
  constructor(@InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>) {}

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Check for overlapping lessons for the same instructor
   */
  private async checkInstructorConflict(
    instructorId: string,
    date: Date,
    startTime: string,
    duration: number,
    excludeLessonId?: string,
  ): Promise<LessonDocument | null> {
    const start = this.timeToMinutes(startTime);
    const end = start + duration;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicts = await this.lessonModel.find({
      instructor: new Types.ObjectId(instructorId),
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [LessonStatus.SCHEDULED, LessonStatus.IN_PROGRESS] },
      _id: excludeLessonId ? { $ne: new Types.ObjectId(excludeLessonId) } : undefined,
    });

    for (const lesson of conflicts) {
      const lessonStart = this.timeToMinutes(lesson.startTime);
      const lessonEnd = lessonStart + lesson.duration;
      // Overlap check
      if (start < lessonEnd && end > lessonStart) {
        return lesson;
      }
    }
    return null;
  }

  /**
   * Check for overlapping lessons for the same student
   */
  private async checkStudentConflict(
    studentId: string,
    date: Date,
    startTime: string,
    duration: number,
    excludeLessonId?: string,
  ): Promise<LessonDocument | null> {
    const start = this.timeToMinutes(startTime);
    const end = start + duration;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicts = await this.lessonModel.find({
      student: new Types.ObjectId(studentId),
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [LessonStatus.SCHEDULED, LessonStatus.IN_PROGRESS] },
      _id: excludeLessonId ? { $ne: new Types.ObjectId(excludeLessonId) } : undefined,
    });

    for (const lesson of conflicts) {
      const lessonStart = this.timeToMinutes(lesson.startTime);
      const lessonEnd = lessonStart + lesson.duration;
      if (start < lessonEnd && end > lessonStart) {
        return lesson;
      }
    }
    return null;
  }

  async create(dto: CreateLessonDto) {
    const createSingle = async (date: Date, startTime: string, duration: number) => {
      // Validate instructor availability
      const instructorConflict = await this.checkInstructorConflict(
        dto.instructor,
        date,
        startTime,
        duration,
      );
      if (instructorConflict) {
        throw new ConflictException(
          `Instructor has a conflicting lesson at ${instructorConflict.startTime} on ${date.toDateString()}`,
        );
      }

      // Validate student availability
      const studentConflict = await this.checkStudentConflict(
        dto.student,
        date,
        startTime,
        duration,
      );
      if (studentConflict) {
        throw new ConflictException(
          `Student has a conflicting lesson at ${studentConflict.startTime} on ${date.toDateString()}`,
        );
      }

      return this.lessonModel.create({
        student: dto.student,
        instructor: dto.instructor,
        course: dto.course,
        date,
        startTime,
        duration,
        transmission: dto.transmission || 'manual',
        vehicleNumber: dto.vehicleNumber || '',
        notes: dto.notes || '',
        status: LessonStatus.SCHEDULED,
      });
    };

    const lessons: LessonDocument[] = [];

    if (dto.recurringWeeks && dto.recurringWeeks > 1 && dto.recurringDays && dto.recurringDays.length > 0) {
      // Create recurring lessons
      const days = dto.recurringDays;
      for (let week = 0; week < dto.recurringWeeks; week++) {
        for (const day of days) {
          const date = new Date(dto.date);
          date.setDate(date.getDate() + week * 7);
          const currentDay = date.getDay();
          const targetDay = day;
          const diff = (targetDay - currentDay + 7) % 7;
          date.setDate(date.getDate() + diff);

          const lesson = await createSingle(date, dto.startTime, dto.duration);
          lessons.push(lesson);
        }
      }
    } else {
      const lesson = await createSingle(dto.date, dto.startTime, dto.duration);
      lessons.push(lesson);
    }

    return lessons;
  }

  findAll(query: LessonQueryDto, userRole: Role, userId: string) {
    const filter: any = {};

    if (userRole === Role.INSTRUCTOR) {
      filter.instructor = new Types.ObjectId(userId);
    }
    if (query.student) filter.student = new Types.ObjectId(query.student);
    if (query.instructor) filter.instructor = new Types.ObjectId(query.instructor);
    if (query.course) filter.course = new Types.ObjectId(query.course);
    if (query.status) filter.status = query.status;
    if (query.startDate && query.endDate) {
      filter.date = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    } else if (query.startDate) {
      filter.date = { $gte: new Date(query.startDate) };
    } else if (query.endDate) {
      filter.date = { $lte: new Date(query.endDate) };
    }

    return this.lessonModel
      .find(filter)
      .populate('student', 'name mobile studentId')
      .populate('instructor', 'name phone')
      .populate('course', 'name price')
      .sort({ date: 1, startTime: 1 })
      .limit(200);
  }

  async findOne(id: string) {
    const lesson = await this.lessonModel
      .findById(id)
      .populate('student', 'name mobile studentId')
      .populate('instructor', 'name phone')
      .populate('course', 'name price');
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Check conflicts if time or date changed
    if (dto.date || dto.startTime || dto.duration || dto.instructor) {
      const newDate = dto.date || lesson.date;
      const newStartTime = dto.startTime || lesson.startTime;
      const newDuration = dto.duration || lesson.duration;
      const newInstructor = dto.instructor || lesson.instructor.toString();

      const conflict = await this.checkInstructorConflict(
        newInstructor,
        new Date(newDate),
        newStartTime,
        newDuration,
        id,
      );
      if (conflict) {
        throw new ConflictException(
          `Instructor has a conflicting lesson at ${conflict.startTime}`,
        );
      }
    }

    Object.assign(lesson, dto);
    await lesson.save();
    return lesson.populate('student instructor course');
  }

  async cancel(id: string) {
    const lesson = await this.lessonModel.findByIdAndUpdate(
      id,
      { status: LessonStatus.CANCELLED },
      { new: true },
    );
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async complete(id: string) {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException('Lesson not found');

    lesson.status = LessonStatus.COMPLETED;
    lesson.actualEndTime = new Date();

    // Update student completed lessons count
    if (lesson.student) {
      const Student = this.lessonModel.db.model('Student');
      await Student.findByIdAndUpdate(lesson.student, {
        $inc: { completedLessons: 1 },
      });
    }

    await lesson.save();
    return lesson.populate('student instructor course');
  }

  async reschedule(id: string, dto: RescheduleLessonDto) {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Check conflicts for new time
    const conflict = await this.checkInstructorConflict(
      lesson.instructor.toString(),
      dto.date,
      dto.startTime,
      dto.duration || lesson.duration,
      id,
    );
    if (conflict) {
      throw new ConflictException(
        `Instructor has a conflicting lesson at ${conflict.startTime}`,
      );
    }

    lesson.date = dto.date;
    lesson.startTime = dto.startTime;
    if (dto.duration) lesson.duration = dto.duration;
    lesson.status = LessonStatus.SCHEDULED;
    await lesson.save();
    return lesson.populate('student instructor course');
  }

  async remove(id: string) {
    const lesson = await this.lessonModel.findByIdAndUpdate(id, {
      status: LessonStatus.CANCELLED,
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return { message: 'Lesson cancelled' };
  }

  // Today's lessons for dashboard
  async getTodaysLessons(userRole: Role, userId: string) {
    const { start, end } = businessDayRange();

    const filter: any = {
      date: { $gte: start, $lte: end },
      status: { $in: [LessonStatus.SCHEDULED, LessonStatus.IN_PROGRESS] },
    };

    if (userRole === Role.INSTRUCTOR) {
      filter.instructor = new Types.ObjectId(userId);
    }

    return this.lessonModel
      .find(filter)
      .populate('student', 'name mobile studentId')
      .populate('instructor', 'name')
      .populate('course', 'name')
      .sort({ startTime: 1 });
  }

  async getStudentLessons(studentId: string) {
    return this.lessonModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('instructor', 'name')
      .populate('course', 'name')
      .sort({ date: -1 });
  }
}

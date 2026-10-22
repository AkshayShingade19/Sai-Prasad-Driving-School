import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Settings, SettingsSchema } from '../settings/schemas/settings.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Instructor, InstructorSchema } from '../instructors/schemas/instructor.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Lesson, LessonSchema } from '../lessons/schemas/lesson.schema';
import { Attendance, AttendanceSchema } from '../attendance/schemas/attendance.schema';
import { DemoBooking, DemoBookingSchema } from '../demo-bookings/schemas/demo-booking.schema';
import { ServiceRequest, ServiceRequestSchema } from '../service-requests/schemas/service-request.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { AuditLog, AuditLogSchema } from '../audit-logs/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: DemoBooking.name, schema: DemoBookingSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
})
export class DatabaseSeedModule {}

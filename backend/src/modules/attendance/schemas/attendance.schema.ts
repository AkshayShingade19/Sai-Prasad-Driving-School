import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  RESCHEDULED = 'rescheduled',
}

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Instructor', required: true })
  instructor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lesson: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  scheduledTime: string;

  @Prop({ enum: Object.values(AttendanceStatus), default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Prop({ default: null })
  checkInTime: Date;

  @Prop({ default: null })
  checkOutTime: Date;

  @Prop({ default: 0 })
  duration: number; // minutes

  @Prop({ default: '' })
  remarks: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  markedBy: Types.ObjectId;

  @Prop({ default: null })
  markedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  editedBy: Types.ObjectId;

  @Prop({ default: null })
  editedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
// Unique constraint: one attendance record per student per lesson
AttendanceSchema.index({ student: 1, lesson: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, instructor: 1 });
AttendanceSchema.index({ date: 1, course: 1 });
AttendanceSchema.index({ student: 1, date: -1 });
AttendanceSchema.index({ status: 1 });

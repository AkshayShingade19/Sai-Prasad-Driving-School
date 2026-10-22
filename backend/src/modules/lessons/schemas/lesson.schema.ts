import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

export enum LessonStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Instructor', required: true })
  instructor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  duration: number; // minutes

  @Prop({ enum: Object.values(LessonStatus), default: LessonStatus.SCHEDULED })
  status: LessonStatus;

  @Prop({ default: 'manual' })
  transmission: string;

  @Prop({ default: '' })
  vehicleNumber: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: null })
  actualStartTime: Date;

  @Prop({ default: null })
  actualEndTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Attendance', default: null })
  attendanceId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
LessonSchema.index({ student: 1, date: 1 });
LessonSchema.index({ instructor: 1, date: 1 });
LessonSchema.index({ course: 1, date: 1 });
LessonSchema.index({ date: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

export enum StudentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  studentId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  emergencyContact: string;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Instructor' })
  instructor: Types.ObjectId;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  plannedEndDate: Date;

  @Prop({ default: 0 })
  plannedLessons: number;

  @Prop({ default: 0 })
  completedLessons: number;

  @Prop({ default: 0 })
  courseFee: number;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ enum: Object.values(StudentStatus), default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: '' })
  transmission: string;

  // Portal login credentials (hashed, never selected by default)
  @Prop({ default: '', select: false })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: false })
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
StudentSchema.index({ studentId: 1 }, { unique: true });
StudentSchema.index({ name: 1 });
StudentSchema.index({ mobile: 1 });
StudentSchema.index({ course: 1 });
StudentSchema.index({ instructor: 1 });
StudentSchema.index({ status: 1 });
StudentSchema.index({ createdAt: -1 });
StudentSchema.index({ name: 'text', mobile: 'text' });

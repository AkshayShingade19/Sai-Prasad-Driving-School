import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  durationWeeks: number;

  @Prop({ required: true })
  sessions: number;

  @Prop({ required: true })
  price: number;

  @Prop({ enum: ['manual', 'automatic', 'both'], default: 'manual' })
  transmission: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

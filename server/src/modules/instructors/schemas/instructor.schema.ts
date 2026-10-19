import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InstructorDocument = Instructor & Document;

@Schema({ timestamps: true })
export class Instructor {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  licenseNumber: string;

  @Prop({ default: '' })
  experience: string;

  @Prop({ enum: ['manual', 'automatic', 'both'], default: 'manual' })
  transmission: string;

  @Prop({ type: [String], default: [] })
  weekdays: string[];

  @Prop({ default: '09:00' })
  startTime: string;

  @Prop({ default: '18:00' })
  endTime: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);

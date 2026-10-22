import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DemoBookingDocument = DemoBooking & Document;

export enum DemoStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  DEMO_SCHEDULED = 'demo_scheduled',
  DEMO_COMPLETED = 'demo_completed',
  CONVERTED = 'converted',
  NOT_INTERESTED = 'not_interested',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class DemoBooking {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  preferredDate: string;

  @Prop({ default: '' })
  preferredTime: string;

  @Prop({ default: '' })
  course: string;

  @Prop({ enum: ['beginner', 'some_experience', 'experienced'], default: 'beginner' })
  experience: string;

  @Prop({ enum: ['phone', 'whatsapp', 'email'], default: 'phone' })
  contactMethod: string;

  @Prop({ default: '' })
  message: string;

  @Prop({ enum: Object.values(DemoStatus), default: DemoStatus.NEW })
  status: DemoStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: null })
  demoDate: Date;

  @Prop({ default: '' })
  demoTime: string;

  @Prop({ default: '' })
  outcome: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', default: null })
  convertedToStudent: Types.ObjectId;

  @Prop({ default: false })
  consent: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const DemoBookingSchema = SchemaFactory.createForClass(DemoBooking);
DemoBookingSchema.index({ status: 1 });
DemoBookingSchema.index({ createdAt: -1 });
DemoBookingSchema.index({ mobile: 1 });
DemoBookingSchema.index({ assignedTo: 1 });

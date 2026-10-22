import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ required: true, default: 'Sai Prasad Driving School' })
  businessName: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  whatsapp: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  state: string;

  @Prop({ default: '' })
  pincode: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;

  @Prop({
    type: Object,
    default: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '18:00', isOpen: true },
      sunday: { open: '09:00', close: '18:00', isOpen: false },
    },
  })
  workingHours: Record<string, { open: string; close: string; isOpen: boolean }>;

  @Prop({ default: '' })
  googleMapsEmbedUrl: string;

  @Prop({ default: '' })
  aboutUs: string;

  @Prop({ default: '' })
  mission: string;

  @Prop({ type: [String], default: [] })
  testimonials: string[];

  @Prop({ default: false })
  isVehicleSchedulingEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

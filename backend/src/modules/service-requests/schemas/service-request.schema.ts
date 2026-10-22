import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceRequestDocument = ServiceRequest & Document;

export enum ServiceStatus {
  NEW = 'new',
  DOCUMENTS_PENDING = 'documents_pending',
  IN_PROGRESS = 'in_progress',
  AWAITING_THIRD_PARTY = 'awaiting_third_party',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ServiceType {
  RC_TRANSFER = 'rc_transfer',
  INSURANCE = 'insurance',
  PUC = 'puc',
  LEARNING_LICENCE = 'learning_licence',
  DRIVING_LICENCE = 'driving_licence',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  requestId: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, trim: true })
  contactNumber: string;

  @Prop({ enum: Object.values(ServiceType), required: true })
  serviceType: ServiceType;

  @Prop({ default: '' })
  vehicleRegNumber: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  documentsProvided: string[];

  @Prop({ type: [String], default: [] })
  documentsRequired: string[];

  @Prop({ enum: Object.values(ServiceStatus), default: ServiceStatus.NEW })
  status: ServiceStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId;

  @Prop({ default: 0 })
  estimatedFee: number;

  @Prop({ default: 0 })
  actualFee: number;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: null })
  completionDate: Date;

  @Prop({ default: false })
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);
ServiceRequestSchema.index({ requestId: 1 }, { unique: true });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ serviceType: 1 });
ServiceRequestSchema.index({ createdAt: -1 });
ServiceRequestSchema.index({ customerName: 1 });

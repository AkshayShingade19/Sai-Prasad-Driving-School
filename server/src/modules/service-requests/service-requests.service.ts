import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceRequest, ServiceRequestDocument, ServiceStatus, ServiceType } from './schemas/service-request.schema';
import { CreateServiceRequestDto, ServiceRequestQueryDto, UpdateServiceRequestDto } from './dto/service-request.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectModel(ServiceRequest.name) private serviceRequestModel: Model<ServiceRequestDocument>,
  ) {}

  private async generateRequestId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.serviceRequestModel.countDocuments({
      requestId: { $regex: `^SRV-${year}-` },
    });
    return `SRV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Public: submit a service request
  async create(dto: CreateServiceRequestDto) {
    const requestId = await this.generateRequestId();

    const defaultDocs = this.getDefaultDocuments(dto.serviceType);

    const request = await this.serviceRequestModel.create({
      requestId,
      customerName: dto.customerName,
      contactNumber: dto.contactNumber,
      serviceType: dto.serviceType,
      vehicleRegNumber: dto.vehicleRegNumber || '',
      description: dto.description || '',
      documentsRequired: dto.documentsRequired || defaultDocs,
      status: ServiceStatus.NEW,
    });

    return {
      message: 'Service request submitted successfully. We will contact you shortly.',
      request,
    };
  }

  private getDefaultDocuments(serviceType: ServiceType): string[] {
    const docs: Record<ServiceType, string[]> = {
      [ServiceType.RC_TRANSFER]: ['RC Book', 'Insurance Copy', 'ID Proof', 'Address Proof'],
      [ServiceType.INSURANCE]: ['RC Book', 'Previous Insurance Copy', 'ID Proof'],
      [ServiceType.PUC]: ['RC Book', 'Previous PUC Certificate (if any)'],
      [ServiceType.LEARNING_LICENCE]: ['Age Proof', 'Address Proof', 'Medical Certificate (Form 1A)'],
      [ServiceType.DRIVING_LICENCE]: ['Learning Licence', 'Age Proof', 'Address Proof'],
      [ServiceType.OTHER]: ['ID Proof'],
    };
    return docs[serviceType] || [];
  }

  async findAll(query: ServiceRequestQueryDto) {
    const filter: any = { isArchived: false };

    if (query.search) {
      const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { customerName: searchRegex },
        { contactNumber: searchRegex },
        { vehicleRegNumber: searchRegex },
        { requestId: searchRegex },
      ];
    }
    if (query.status) filter.status = query.status;
    if (query.serviceType) filter.serviceType = query.serviceType;

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.serviceRequestModel
        .find(filter)
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.serviceRequestModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const request = await this.serviceRequestModel
      .findById(id)
      .populate('assignedTo', 'name');
    if (!request) throw new NotFoundException('Service request not found');
    return request;
  }

  async update(id: string, dto: UpdateServiceRequestDto) {
    const request = await this.serviceRequestModel.findById(id);
    if (!request) throw new NotFoundException('Service request not found');

    if (dto.status === ServiceStatus.COMPLETED && !request.completionDate) {
      (dto as any).completionDate = new Date();
    }

    Object.assign(request, dto);
    await request.save();
    return request;
  }

  async remove(id: string) {
    const request = await this.serviceRequestModel.findByIdAndUpdate(id, { isArchived: true });
    if (!request) throw new NotFoundException('Service request not found');
    return { message: 'Service request archived' };
  }

  async getStats() {
    const [total, byStatus, byType] = await Promise.all([
      this.serviceRequestModel.countDocuments({ isArchived: false }),
      this.serviceRequestModel.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.serviceRequestModel.aggregate([
        { $match: { isArchived: false } },
        { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts: Record<string, number> = {};
    byStatus.forEach((s: any) => { statusCounts[s._id] = s.count; });

    const typeCounts: Record<string, number> = {};
    byType.forEach((t: any) => { typeCounts[t._id] = t.count; });

    return { total, byStatus: statusCounts, byType: typeCounts };
  }
}

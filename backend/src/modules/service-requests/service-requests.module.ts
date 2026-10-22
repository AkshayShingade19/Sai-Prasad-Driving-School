import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ServiceRequest.name, schema: ServiceRequestSchema }])],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}

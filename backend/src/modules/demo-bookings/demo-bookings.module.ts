import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoBookingsController } from './demo-bookings.controller';
import { DemoBookingsService } from './demo-bookings.service';
import { DemoBooking, DemoBookingSchema } from './schemas/demo-booking.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DemoBooking.name, schema: DemoBookingSchema }])],
  controllers: [DemoBookingsController],
  providers: [DemoBookingsService],
  exports: [DemoBookingsService],
})
export class DemoBookingsModule {}

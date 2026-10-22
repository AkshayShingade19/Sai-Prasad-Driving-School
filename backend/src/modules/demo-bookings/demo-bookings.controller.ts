import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DemoBookingsService } from './demo-bookings.service';
import { CreateDemoBookingDto, DemoBookingQueryDto, UpdateDemoBookingDto } from './dto/demo-booking.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Demo Bookings')
@Controller('demo-bookings')
export class DemoBookingsController {
  constructor(private demoBookingsService: DemoBookingsService) {}

  // Public endpoint - no auth required
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a demo booking request (public)' })
  async create(@Body() dto: CreateDemoBookingDto) {
    return this.demoBookingsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get()
  @ApiOperation({ summary: 'List demo bookings' })
  async findAll(@Query() query: DemoBookingQueryDto) {
    return this.demoBookingsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get('stats')
  @ApiOperation({ summary: 'Get demo booking statistics' })
  async getStats() {
    return this.demoBookingsService.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming demos' })
  async getUpcomingDemos() {
    return this.demoBookingsService.getUpcomingDemos();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get(':id')
  @ApiOperation({ summary: 'Get demo booking by ID' })
  async findOne(@Param('id') id: string) {
    return this.demoBookingsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update demo booking' })
  async update(@Param('id') id: string, @Body() dto: UpdateDemoBookingDto) {
    return this.demoBookingsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert demo booking to student' })
  async convertToStudent(@Param('id') id: string, @Body() studentData: any) {
    return this.demoBookingsService.convertToStudent(id, studentData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete demo booking' })
  async remove(@Param('id') id: string) {
    return this.demoBookingsService.remove(id);
  }
}

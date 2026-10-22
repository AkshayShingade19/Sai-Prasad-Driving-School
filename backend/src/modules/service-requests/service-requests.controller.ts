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
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto, ServiceRequestQueryDto, UpdateServiceRequestDto } from './dto/service-request.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Service Requests')
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private serviceRequestsService: ServiceRequestsService) {}

  // Public endpoint
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a service request (public)' })
  async create(@Body() dto: CreateServiceRequestDto) {
    return this.serviceRequestsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get()
  @ApiOperation({ summary: 'List service requests' })
  async findAll(@Query() query: ServiceRequestQueryDto) {
    return this.serviceRequestsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get('stats')
  @ApiOperation({ summary: 'Get service request statistics' })
  async getStats() {
    return this.serviceRequestsService.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get(':id')
  @ApiOperation({ summary: 'Get service request by ID' })
  async findOne(@Param('id') id: string) {
    return this.serviceRequestsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update service request' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceRequestDto) {
    return this.serviceRequestsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Archive service request' })
  async remove(@Param('id') id: string) {
    return this.serviceRequestsService.remove(id);
  }
}

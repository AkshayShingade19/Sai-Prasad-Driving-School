import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentQueryDto } from './dto/payment.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post()
  @ApiOperation({ summary: 'Record a payment' })
  async create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  async findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get payment statistics' })
  async getStats() {
    return this.paymentsService.getStats();
  }

  @Get('pending')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get pending payments report' })
  async getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student payment history' })
  async getStudentPayments(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentPayments(studentId);
  }

  @Get('student/:studentId/balance')
  @ApiOperation({ summary: 'Get student balance' })
  async getStudentBalance(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentBalance(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment record' })
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { StudentPortalService } from './student-portal.service';
import { StudentLoginDto } from '../auth/dto/student-login.dto';
import { StudentChangePasswordDto } from './dto/student-change-password.dto';
import { StudentAuthGuard } from './guards/student-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Student Portal')
@Controller('student-portal')
export class StudentPortalController {
  constructor(private portalService: StudentPortalService) {}

  // ---------- Public ----------
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student login with email and password' })
  async login(@Body() dto: StudentLoginDto) {
    return this.portalService.login(dto);
  }

  // ---------- Authenticated ----------
  @ApiBearerAuth()
  @UseGuards(StudentAuthGuard)
  @Get('dashboard')
  @ApiOperation({ summary: 'Student dashboard summary' })
  async dashboard(@Req() req: any) {
    return this.portalService.getDashboard(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(StudentAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Student profile' })
  async profile(@Req() req: any) {
    return this.portalService.getProfile(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(StudentAuthGuard)
  @Get('attendance')
  @ApiOperation({ summary: 'Student attendance history and summary' })
  async attendance(@Req() req: any) {
    return this.portalService.getAttendance(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(StudentAuthGuard)
  @Get('lessons')
  @ApiOperation({ summary: 'Student lesson schedule' })
  async lessons(@Req() req: any) {
    return this.portalService.getLessons(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(StudentAuthGuard)
  @Get('payments')
  @ApiOperation({ summary: 'Student payment history and balance' })
  async payments(@Req() req: any) {
    return this.portalService.getPayments(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(StudentAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Student changes own portal password' })
  async changePassword(@Req() req: any, @Body() dto: StudentChangePasswordDto) {
    return this.portalService.changePassword(req.user.sub, dto);
  }
}

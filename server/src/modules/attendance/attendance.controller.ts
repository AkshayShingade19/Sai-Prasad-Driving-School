import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, BulkMarkAttendanceDto, MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Mark attendance for a lesson' })
  async markAttendance(@Body() dto: MarkAttendanceDto, @Req() req: any) {
    return this.attendanceService.markAttendance(dto, req.user.sub);
  }

  @Post('bulk-mark')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Bulk mark attendance' })
  async bulkMarkAttendance(@Body() dto: BulkMarkAttendanceDto, @Req() req: any) {
    return this.attendanceService.bulkMarkAttendance(dto, req.user.sub);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update/correct attendance' })
  async updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto, @Req() req: any) {
    return this.attendanceService.updateAttendance(id, dto, req.user.sub);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily attendance sheet' })
  async getDailyAttendance(
    @Query('date') date: string,
    @Query('instructorId') instructorId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.attendanceService.getDailyAttendance(date, instructorId, courseId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student attendance history' })
  async getStudentAttendance(@Param('studentId') studentId: string) {
    return this.attendanceService.getStudentAttendance(studentId);
  }

  @Get('today-summary')
  @ApiOperation({ summary: "Get today's attendance summary" })
  async getTodaySummary() {
    return this.attendanceService.getTodaySummary();
  }

  @Get('frequent-absences')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get students with frequent absences' })
  async getFrequentAbsences(@Query('threshold') threshold?: string) {
    return this.attendanceService.getFrequentAbsences(threshold ? parseInt(threshold, 10) : 3);
  }

  @Get('instructor-monthly/:instructorId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get monthly instructor summary' })
  async getInstructorMonthlySummary(
    @Param('instructorId') instructorId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.attendanceService.getInstructorMonthlySummary(
      instructorId,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List attendance records' })
  async findAll(@Query() query: AttendanceQueryDto, @Req() req: any) {
    return this.attendanceService.findAll(query, req.user.role, req.user.sub);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export attendance as CSV' })
  async exportCSV(@Query() query: AttendanceQueryDto, @Res() res: Response) {
    const csv = await this.attendanceService.exportCSV(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }
}

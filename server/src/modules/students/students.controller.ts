import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List students with search and filters' })
  async findAll(@Query() query: StudentQueryDto, @Req() req: any) {
    return this.studentsService.findAll(query, req.user.role, req.user.sub);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get student statistics' })
  async getStats() {
    return this.studentsService.getStats();
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get scheduled students for a date (attendance sheet)' })
  async getScheduledStudents(
    @Query('date') date: string,
    @Query('instructorId') instructorId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.studentsService.getScheduledStudents(new Date(date), instructorId, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student profile' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.studentsService.findOne(id, req.user.role, req.user.sub);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post()
  @ApiOperation({ summary: 'Register a new student' })
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update student details' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset a student portal password' })
  async resetPassword(@Param('id') id: string, @Body() body: { password?: string }) {
    return this.studentsService.resetPassword(id, body?.password);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Get(':id/portal-credentials')
  @ApiOperation({ summary: 'Get student portal credential status' })
  async getPortalCredentials(@Param('id') id: string) {
    return this.studentsService.getPortalCredentials(id);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post(':id/portal-credentials')
  @ApiOperation({ summary: 'Set student portal username and password' })
  async setPortalCredentials(
    @Param('id') id: string,
    @Body() body: { email?: string; password?: string; isActive?: boolean },
  ) {
    return this.studentsService.setPortalCredentials(id, body || {});
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Archive a student' })
  async archive(@Param('id') id: string) {
    return this.studentsService.archive(id);
  }
}

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
import { LessonsService } from './lessons.service';
import { CreateLessonDto, LessonQueryDto, RescheduleLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons' })
  findAll(@Query() query: LessonQueryDto, @Req() req: any) {
    return this.lessonsService.findAll(query, req.user.role, req.user.sub);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's lessons" })
  getTodaysLessons(@Req() req: any) {
    return this.lessonsService.getTodaysLessons(req.user.role, req.user.sub);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get lessons for a student' })
  getStudentLessons(@Param('studentId') studentId: string) {
    return this.lessonsService.getStudentLessons(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post()
  @ApiOperation({ summary: 'Schedule a lesson' })
  create(@Body() dto: CreateLessonDto) {
    return this.lessonsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a lesson' })
  cancel(@Param('id') id: string) {
    return this.lessonsService.cancel(id);
  }

  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark lesson as completed' })
  complete(@Param('id') id: string) {
    return this.lessonsService.complete(id);
  }

  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a lesson' })
  reschedule(@Param('id') id: string, @Body() dto: RescheduleLessonDto) {
    return this.lessonsService.reschedule(id, dto);
  }
}

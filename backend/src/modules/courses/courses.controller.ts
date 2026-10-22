import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // Public: the marketing site lists courses without a signed-in user.
  @Public()
  @Get()
  @ApiOperation({ summary: 'List all courses' })
  async findAll(@Query('active') active?: string) {
    return this.coursesService.findAll(active !== undefined ? active === 'true' : undefined);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a course' })
  async create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a course' })
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Archive a course' })
  async remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}

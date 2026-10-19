import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private instructorsService: InstructorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all instructors' })
  findAll(@Query('search') search?: string, @Query('active') active?: string) {
    return this.instructorsService.findAll(search, active !== undefined ? active === 'true' : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get instructor by ID' })
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create an instructor' })
  create(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an instructor' })
  update(@Param('id') id: string, @Body() dto: UpdateInstructorDto) {
    return this.instructorsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Archive an instructor' })
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<CourseDocument>) {}

  findAll(isActive?: boolean) {
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive;
    return this.courseModel.find(filter).sort({ createdAt: -1 });
  }

  findOne(id: string) {
    return this.courseModel.findById(id);
  }

  async create(dto: CreateCourseDto) {
    return this.courseModel.create(dto);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.courseModel.findByIdAndUpdate(id, dto, { new: true });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async remove(id: string) {
    const course = await this.courseModel.findByIdAndUpdate(id, { isActive: false });
    if (!course) throw new NotFoundException('Course not found');
    return { message: 'Course archived' };
  }
}

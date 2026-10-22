import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Instructor, InstructorDocument } from './schemas/instructor.schema';
import { CreateInstructorDto, UpdateInstructorDto } from './dto/instructor.dto';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
  ) {}

  findAll(search?: string, isActive?: boolean) {
    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive;
    return this.instructorModel.find(filter).sort({ name: 1 });
  }

  async findOne(id: string) {
    const instructor = await this.instructorModel.findById(id);
    if (!instructor) throw new NotFoundException('Instructor not found');
    return instructor;
  }

  create(dto: CreateInstructorDto) {
    return this.instructorModel.create(dto);
  }

  async update(id: string, dto: UpdateInstructorDto) {
    const instructor = await this.instructorModel.findByIdAndUpdate(id, dto, { new: true });
    if (!instructor) throw new NotFoundException('Instructor not found');
    return instructor;
  }

  async remove(id: string) {
    const instructor = await this.instructorModel.findByIdAndUpdate(id, { isActive: false });
    if (!instructor) throw new NotFoundException('Instructor not found');
    return { message: 'Instructor archived' };
  }
}

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Role } from '../auth/roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query: { search?: string; role?: string; isActive?: boolean }) {
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    return this.userModel
      .find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Staff member not found');
    return user;
  }

  async create(createStaffDto: CreateStaffDto) {
    const hashed = await bcrypt.hash(createStaffDto.password, 12);
    const user = await this.userModel.create({
      name: createStaffDto.name,
      email: createStaffDto.email.toLowerCase().trim(),
      phone: createStaffDto.phone || '',
      role: createStaffDto.role || Role.RECEPTIONIST,
      password: hashed,
      isActive: true,
    });
    const result = user.toObject();
    const { password, ...rest } = result;
    return rest;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto, requesterRole: Role) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Staff member not found');

    // Only admin can change roles or reactivate/deactivate admins
    if (requesterRole !== Role.ADMIN && (updateStaffDto.role || updateStaffDto.isActive !== undefined)) {
      throw new ForbiddenException('Only the owner/admin can change roles or account status');
    }

    if (updateStaffDto.password) {
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 12);
    }

    Object.assign(user, updateStaffDto);
    await user.save();
    const result = user.toObject();
    const { password, ...rest } = result;
    return rest;
  }

  async remove(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const user = await this.userModel.findByIdAndUpdate(id, { isActive: false });
    if (!user) throw new NotFoundException('Staff member not found');
    return { message: 'Staff member deactivated successfully' };
  }
}

import { IsBoolean, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DemoStatus } from '../schemas/demo-booking.schema';

export class CreateDemoBookingDto {
  @ApiProperty({ example: 'Rahul Verma' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[0-9+\-\s]{10,15}$/, { message: 'Invalid mobile number' })
  mobile: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '2026-01-20' })
  @IsOptional()
  @IsString()
  preferredDate?: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiPropertyOptional({ example: 'Beginner Driving Course' })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'some_experience', 'experienced'] })
  @IsOptional()
  @IsEnum(['beginner', 'some_experience', 'experienced'])
  experience?: string;

  @ApiPropertyOptional({ enum: ['phone', 'whatsapp', 'email'] })
  @IsOptional()
  @IsEnum(['phone', 'whatsapp', 'email'])
  contactMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  consent: boolean;
}

export class UpdateDemoBookingDto {
  @ApiPropertyOptional({ enum: DemoStatus })
  @IsOptional()
  @IsEnum(DemoStatus)
  status?: DemoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demoDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  demoTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  outcome?: string;
}

export class DemoBookingQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: string;
}

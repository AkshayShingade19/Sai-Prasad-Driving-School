import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../schemas/attendance.schema';

export class MarkAttendanceDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: '2026-01-15T09:05:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkInTime?: Date;

  @ApiPropertyOptional({ example: '2026-01-15T10:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkOutTime?: Date;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkInTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkOutTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class AttendanceQueryDto {
  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  instructor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  student?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class BulkMarkAttendanceDto {
  @ApiProperty({ type: [MarkAttendanceDto] })
  @Type(() => MarkAttendanceDto)
  records: MarkAttendanceDto[];
}

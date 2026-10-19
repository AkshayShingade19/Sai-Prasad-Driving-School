import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  student: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  instructor: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: 60 })
  @IsInt()
  @Min(15)
  duration: number;

  @ApiPropertyOptional({ enum: ['manual', 'automatic', 'both'] })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  // Recurring lessons
  @ApiPropertyOptional({ description: 'Number of weeks to repeat (1 = single lesson)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  recurringWeeks?: number;

  @ApiPropertyOptional({ description: 'Days of week for recurring lessons (0=Sun ... 6=Sat)' })
  @IsOptional()
  @IsInt({ each: true })
  recurringDays?: number[];
}

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;

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
  @IsString()
  transmission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LessonQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  student?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  instructor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  course?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @ValidateIf((o) => o.startDate)
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @ValidateIf((o) => o.endDate)
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class RescheduleLessonDto {
  @ApiProperty({ example: '2026-01-20' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;
}

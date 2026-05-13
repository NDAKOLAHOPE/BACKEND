import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateExamDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  subject!: string;

  @IsEnum(['WRITTEN', 'ORAL', 'PRACTICAL', 'PROJECT', 'QUIZ', 'MIDTERM', 'FINAL'])
  examType!: 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ' | 'MIDTERM' | 'FINAL';

  @IsInt()
  classGroupId!: number;

  @IsOptional()
  @IsInt()
  academicYearId?: number;

  @IsDate()
  examDate!: Date;

  @IsOptional()
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  passingScore?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  coefficient?: number;

  @IsOptional()
  @IsEnum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'GRADING', 'PUBLISHED'])
  status?: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'GRADING' | 'PUBLISHED';

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  materialsAllowed?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  createdBy?: number;
}

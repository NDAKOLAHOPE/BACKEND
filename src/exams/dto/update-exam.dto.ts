import { IsInt, IsOptional, IsString, IsEnum, IsNumber, IsDate } from 'class-validator';

export class UpdateExamDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEnum(['WRITTEN', 'ORAL', 'PRACTICAL', 'PROJECT', 'QUIZ', 'MIDTERM', 'FINAL'])
  examType?: 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ' | 'MIDTERM' | 'FINAL';

  @IsOptional()
  @IsDate()
  examDate?: Date;

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
}

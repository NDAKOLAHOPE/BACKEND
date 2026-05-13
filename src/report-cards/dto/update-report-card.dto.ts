import { IsInt, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export class UpdateReportCardDto {
  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @IsOptional()
  @IsNumber()
  average?: number;

  @IsOptional()
  @IsNumber()
  percentage?: number;

  @IsOptional()
  @IsInt()
  classRank?: number;

  @IsOptional()
  @IsString()
  principalComments?: string;

  @IsOptional()
  @IsString()
  teacherComments?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'GENERATED', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED';

  @IsOptional()
  @IsEnum(['PROMOTED', 'RETAINED', 'GRADUATED', 'EXPELLED', 'WITHDRAWN', 'UNDECIDED'])
  decision?: 'PROMOTED' | 'RETAINED' | 'GRADUATED' | 'EXPELLED' | 'WITHDRAWN' | 'UNDECIDED';
}

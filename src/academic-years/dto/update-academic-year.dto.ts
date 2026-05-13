import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateAcademicYearDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

  @IsOptional()
  @IsString()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

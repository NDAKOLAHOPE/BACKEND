import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateAcademicYearDto {
  @IsString()
  name!: string;

  @IsDate()
  startDate!: Date;

  @IsDate()
  endDate!: Date;

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

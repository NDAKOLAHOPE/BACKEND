import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';

export class GenerateReportCardsDto {
  @IsInt()
  academicYearId!: number;

  @IsOptional()
  @IsInt()
  classGroupId?: number;

  @IsString()
  term!: string;

  @IsOptional()
  @IsInt()
  generatedBy?: number;
}

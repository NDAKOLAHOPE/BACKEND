import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGradeDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  term?: string;
}


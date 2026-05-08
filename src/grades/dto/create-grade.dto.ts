import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGradeDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsString()
  subject!: string;

  @IsNumber()
  score!: number;

  @IsOptional()
  @IsString()
  term?: string;
}

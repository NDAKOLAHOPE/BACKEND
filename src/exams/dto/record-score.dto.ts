import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordScoreDto {
  @IsInt()
  studentId!: number;

  @IsNumber()
  score!: number;

  @IsOptional()
  @IsString()
  comments?: string;
}

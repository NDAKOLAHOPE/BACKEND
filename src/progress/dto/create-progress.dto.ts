import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProgressDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsString()
  @IsNotEmpty()
  note!: string;

  @IsOptional()
  @IsString()
  // allow empty string from frontend to clear note if needed
  _clear?: string;
}

import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsString()
  message!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}


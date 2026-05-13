import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'UNEXCUSED'])
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNEXCUSED';

  @IsOptional()
  @IsDate()
  checkInTime?: Date;

  @IsOptional()
  @IsDate()
  checkOutTime?: Date;

  @IsOptional()
  @IsInt()
  lateMinutes?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isExcused?: boolean;

  @IsOptional()
  @IsString()
  excuseDocument?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

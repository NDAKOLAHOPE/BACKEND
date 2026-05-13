import { IsDate, IsInt, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  studentId!: number;

  @IsDate()
  date!: Date;

  @IsOptional()
  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'UNEXCUSED'])
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNEXCUSED';

  @IsOptional()
  @IsEnum(['DAILY', 'SESSION', 'EVENT'])
  attendanceType?: 'DAILY' | 'SESSION' | 'EVENT';

  @IsOptional()
  @IsInt()
  classGroupId?: number;

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
  notes?: string;

  @IsOptional()
  @IsInt()
  recordedBy?: number;
}

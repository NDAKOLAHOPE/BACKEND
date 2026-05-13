import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt()
  studentId!: number;

  @IsInt()
  academicYearId!: number;

  @IsOptional()
  @IsInt()
  classGroupId?: number;

  @IsOptional()
  @IsEnum(['NEW', 'RETURNING', 'TRANSFER', 'EXCHANGE'])
  enrollmentType?: 'NEW' | 'RETURNING' | 'TRANSFER' | 'EXCHANGE';

  @IsOptional()
  @IsNumber()
  tuitionFee?: number;

  @IsOptional()
  @IsEnum(['UNPAID', 'PARTIAL', 'PAID', 'EXEMPT'])
  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID' | 'EXEMPT';

  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

  @IsOptional()
  @IsString()
  notes?: string;
}

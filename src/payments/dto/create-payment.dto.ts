import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  paymentDate?: string; // ISO

  @IsOptional()
  @IsIn(['PENDING', 'PAID'])
  status?: 'PENDING' | 'PAID';
}

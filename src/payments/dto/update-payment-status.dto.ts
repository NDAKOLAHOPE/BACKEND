import { IsIn } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsIn(['PENDING', 'PAID'])
  status!: 'PENDING' | 'PAID';
}


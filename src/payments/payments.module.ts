import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../db/entities/payment.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, StudentParent])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

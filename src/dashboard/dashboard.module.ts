import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../db/entities/student.entity.js';
import { User } from '../db/entities/user.entity.js';
import { Grade } from '../db/entities/grade.entity.js';
import { Payment } from '../db/entities/payment.entity.js';
import { ParentMessage } from '../db/entities/parent-message.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, Grade, Payment, ParentMessage])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}


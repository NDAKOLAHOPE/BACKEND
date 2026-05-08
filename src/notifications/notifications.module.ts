import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentMessage } from '../db/entities/parent-message.entity.js';
import { Payment } from '../db/entities/payment.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudentParent, Payment, ParentMessage])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}

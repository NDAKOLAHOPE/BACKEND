import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { Enrollment } from '../db/entities/enrollment.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, StudentParent])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}

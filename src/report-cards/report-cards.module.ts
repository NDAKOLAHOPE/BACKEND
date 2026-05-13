import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportCardsService } from './report-cards.service.js';
import { ReportCardsController } from './report-cards.controller.js';
import { ReportCard } from '../db/entities/report-card.entity.js';
import { ExamScore } from '../db/entities/exam-score.entity.js';
import { Student } from '../db/entities/student.entity.js';
import { Attendance } from '../db/entities/attendance.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { Enrollment } from '../db/entities/enrollment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ReportCard, ExamScore, Student, Attendance, StudentParent, Enrollment])],
  controllers: [ReportCardsController],
  providers: [ReportCardsService],
  exports: [ReportCardsService],
})
export class ReportCardsModule {}

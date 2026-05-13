import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../db/entities/student.entity.js';
import { User } from '../db/entities/user.entity.js';
import { Grade } from '../db/entities/grade.entity.js';
import { Payment } from '../db/entities/payment.entity.js';
import { ParentMessage } from '../db/entities/parent-message.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { Attendance } from '../db/entities/attendance.entity.js';
import { Exam } from '../db/entities/exam.entity.js';
import { ExamScore } from '../db/entities/exam-score.entity.js';
import { ReportCard } from '../db/entities/report-card.entity.js';
import { Enrollment } from '../db/entities/enrollment.entity.js';
import { ClassGroup } from '../db/entities/class-group.entity.js';
import { AcademicYear } from '../db/entities/academic-year.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      User,
      Grade,
      Payment,
      ParentMessage,
      StudentParent,
      Attendance,
      Exam,
      ExamScore,
      ReportCard,
      Enrollment,
      ClassGroup,
      AcademicYear,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

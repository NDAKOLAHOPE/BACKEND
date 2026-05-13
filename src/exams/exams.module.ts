import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsService } from './exams.service.js';
import { ExamsController } from './exams.controller.js';
import { Exam } from '../db/entities/exam.entity.js';
import { ExamScore } from '../db/entities/exam-score.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamScore])],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}

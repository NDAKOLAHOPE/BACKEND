import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from '../db/entities/progress.entity.js';
import { Student } from '../db/entities/student.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Progress, Student, StudentParent])],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}

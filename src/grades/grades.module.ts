import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from '../db/entities/grade.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { GradesController } from './grades.controller.js';
import { GradesService } from './grades.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, StudentParent])],
  controllers: [GradesController],
  providers: [GradesService],
})
export class GradesModule {}

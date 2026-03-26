import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../db/entities/student.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { User } from '../db/entities/user.entity.js';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudentParent, User])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}


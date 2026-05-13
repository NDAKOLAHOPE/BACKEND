import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearsService } from './academic-years.service.js';
import { AcademicYearsController } from './academic-years.controller.js';
import { AcademicYear } from '../db/entities/academic-year.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYear])],
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService],
  exports: [AcademicYearsService],
})
export class AcademicYearsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassGroupsService } from './class-groups.service.js';
import { ClassGroupsController } from './class-groups.controller.js';
import { ClassGroup } from '../db/entities/class-group.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ClassGroup])],
  controllers: [ClassGroupsController],
  providers: [ClassGroupsService],
  exports: [ClassGroupsService],
})
export class ClassGroupsModule {}

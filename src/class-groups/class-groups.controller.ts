import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassGroupsService } from './class-groups.service.js';
import { CreateClassGroupDto } from './dto/create-class-group.dto.js';
import { UpdateClassGroupDto } from './dto/update-class-group.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('class-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
export class ClassGroupsController {
  constructor(private readonly classGroupsService: ClassGroupsService) {}

  @Post()
  create(@Body() dto: CreateClassGroupDto) {
    return this.classGroupsService.create(dto);
  }

  @Get()
  findAll(
    @Query('academicYearId') academicYearId?: string,
  ) {
    if (academicYearId) {
      return this.classGroupsService.findByAcademicYear(Number(academicYearId));
    }
    return this.classGroupsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.classGroupsService.findById(id);
  }

  @Get(':id/students')
  getStudents(@Param('id', ParseIntPipe) id: number) {
    return this.classGroupsService.getStudents(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassGroupDto) {
    return this.classGroupsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classGroupsService.remove(id);
  }
}

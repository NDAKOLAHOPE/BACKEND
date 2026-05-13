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
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classGroupId') classGroupId?: string,
  ) {
    if (studentId) {
      return this.enrollmentsService.findByStudent(Number(studentId));
    }
    if (academicYearId) {
      return this.enrollmentsService.findByAcademicYear(Number(academicYearId));
    }
    if (classGroupId) {
      return this.enrollmentsService.findByClassGroup(Number(classGroupId));
    }
    return this.enrollmentsService.findAll();
  }

  @Get('my')
  myEnrollments(@CurrentUser() user: { sub: number; role: string }) {
    // For parents to see their children's enrollments
    if (user.role === 'PARENT' || user.role === 'MERE') {
      return this.enrollmentsService.findByParent(user.sub);
    }
    // For student themselves, return their own enrollment
    return this.enrollmentsService.findByStudent(user.sub);
  }

  @Get('student/:studentId/current')
  getStudentCurrent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.enrollmentsService.getStudentCurrentEnrollment(studentId);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, dto);
  }

  @Post(':id/transfer')
  transfer(
    @Param('id', ParseIntPipe) enrollmentId: number,
    @Body('newClassGroupId') newClassGroupId: number,
  ) {
    return this.enrollmentsService.transferEnrollment(enrollmentId, newClassGroupId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}

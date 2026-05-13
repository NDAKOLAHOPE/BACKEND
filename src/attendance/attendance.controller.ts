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
import { AttendanceService } from './attendance.service.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER', 'PARENT')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('ADMIN', 'TEACHER')
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Post('bulk')
  @Roles('ADMIN', 'TEACHER')
  createBulk(@Body() dtos: CreateAttendanceDto[]) {
    return this.attendanceService.createBulk(dtos);
  }

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('studentId') studentId?: string,
    @Query('classGroupId') classGroupId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: { sub: number; role: string },
  ) {
    if (date) {
      return this.attendanceService.findByDate(new Date(date));
    }
    if (studentId) {
      return this.attendanceService.findByStudent(Number(studentId));
    }
    if (classGroupId && startDate && endDate) {
      return this.attendanceService.findByRange(
        new Date(startDate),
        new Date(endDate),
        undefined,
        Number(classGroupId),
      );
    }
    if (startDate && endDate) {
      return this.attendanceService.findByRange(
        new Date(startDate),
        new Date(endDate),
        Number(studentId),
      );
    }
    // PARENT can only see their own children
    if (user?.role === 'PARENT') {
      // Would need to get students for parent first
    }
    return this.attendanceService.findByStudent(Number(studentId));
  }

  @Get('my')
  @Roles('PARENT')
  myAttendance(@CurrentUser() user: { sub: number }) {
    return this.attendanceService.findByStudent(user.sub);
  }

  @Get('class/:classGroupId')
  @Roles('ADMIN', 'TEACHER')
  getClassAttendance(
    @Param('classGroupId', ParseIntPipe) classGroupId: number,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByClassGroup(
      classGroupId,
      date ? new Date(date) : new Date(),
    );
  }

  @Get('statistics')
  @Roles('ADMIN', 'TEACHER')
  getStatistics(
    @Query('studentId') studentId?: string,
    @Query('classGroupId') classGroupId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getStatistics(
      studentId ? Number(studentId) : undefined,
      classGroupId ? Number(classGroupId) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('rate/:studentId')
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  getAttendanceRate(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.attendanceService.getStudentAttendanceRate(
      studentId,
      academicYearId ? Number(academicYearId) : undefined,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'TEACHER')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'TEACHER')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { GradesService } from './grades.service.js';
import { CreateGradeDto } from './dto/create-grade.dto.js';
import { UpdateGradeDto } from './dto/update-grade.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  create(@Body() dto: CreateGradeDto) {
    return this.gradesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGradeDto) {
    return this.gradesService.update(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  list(
    @Query('studentId') studentId?: string,
    @CurrentUser() user?: { sub: number; role: string },
  ) {
    const role = user?.role;
    const parsedStudentId = studentId ? Number(studentId) : undefined;

    return this.gradesService.listForRole({
      role: role!,
      studentId: parsedStudentId,
      parentId: user?.sub,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT')
  my(@CurrentUser() user: { sub: number }) {
    return this.gradesService.listForRole({ role: 'PARENT', parentId: user.sub });
  }

  @Get('analytics/terms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT')
  analyticsTerms(
    @Query('term') term?: string,
    @CurrentUser() user?: { sub: number; role: string },
  ) {
    const role = user!.role;
    return this.gradesService.analyticsTerms({ role, parentId: user!.sub, term });
  }
}


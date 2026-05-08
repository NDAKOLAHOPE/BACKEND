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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateProgressDto } from './dto/create-progress.dto.js';
import { ProgressService } from './progress.service.js';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT', 'MERE')
  create(
    @Body() dto: CreateProgressDto,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.progressService.create(dto, user.role, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  list(
    @Query('studentId') studentId?: string,
    @CurrentUser() user?: { sub: number; role: string },
  ) {
    const parsedStudentId = studentId ? Number(studentId) : undefined;
    return this.progressService.listForRole({
      role: user?.role ?? 'TEACHER',
      studentId: parsedStudentId,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PARENT', 'MERE')
  my(@CurrentUser() user: { sub: number }) {
    return this.progressService.listMy(user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT', 'MERE')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProgressDto,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.progressService.update(id, dto, user.role, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'TEACHER', 'PARENT', 'MERE')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    return this.progressService.remove(id, user.role, user.sub);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AcademicYearsService } from './academic-years.service.js';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('academic-years')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearsService.create(dto);
  }

  @Get()
  findAll(
    @Query('current') current?: string,
  ) {
    if (current === 'true') {
      return this.academicYearsService.getCurrent();
    }
    return this.academicYearsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAcademicYearDto) {
    return this.academicYearsService.update(id, dto);
  }

  @Patch(':id/set-current')
  setCurrent(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearsService.setCurrent(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearsService.remove(id);
  }
}

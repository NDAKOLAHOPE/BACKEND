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
import { ReportCardsService } from './report-cards.service.js';
import { GenerateReportCardsDto } from './dto/generate-report-cards.dto.js';
import { UpdateReportCardDto } from './dto/update-report-card.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('report-cards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
export class ReportCardsController {
  constructor(private readonly reportCardsService: ReportCardsService) {}

  @Post('generate')
  generate(@Body() dto: GenerateReportCardsDto) {
    return this.reportCardsService.generateReportCards(dto);
  }

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    if (studentId) {
      return this.reportCardsService.findByStudent(Number(studentId));
    }
    if (academicYearId) {
      return this.reportCardsService.findByAcademicYear(Number(academicYearId));
    }
    return this.reportCardsService.findAll();
  }

  @Get('my')
  @Roles('PARENT', 'STUDENT')
  myReportCards(@CurrentUser() user: { sub: number; role: string }) {
    if (user.role === 'PARENT' || user.role === 'MERE') {
      return this.reportCardsService.findByParent(user.sub);
    }
    // Student
    return this.reportCardsService.findByStudent(user.sub);
  }

  @Get('statistics')
  @Roles('ADMIN', 'TEACHER')
  getStatistics(@Query('academicYearId') academicYearId?: string) {
    return this.reportCardsService.getStatistics(
      academicYearId ? Number(academicYearId) : undefined,
    );
  }

  @Get('student/:studentId/latest')
  getLatest(
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.reportCardsService.getStudentLatestReportCard(studentId);
  }

  @Get(':id/export')
  exportToPDF(@Param('id', ParseIntPipe) id: number) {
    return this.reportCardsService.exportToPDF(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportCardsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportCardDto,
  ) {
    return this.reportCardsService.update(id, dto);
  }

  @Patch(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.reportCardsService.publish(id);
  }

  @Patch(':id/comments')
  addComments(
    @Param('id', ParseIntPipe) id: number,
    @Body('teacherComments') teacherComments: string,
    @Body('principalComments') principalComments?: string,
  ) {
    return this.reportCardsService.addComments(id, teacherComments, principalComments);
  }

  @Patch(':id/decision')
  setDecision(
    @Param('id', ParseIntPipe) id: number,
    @Body('decision') decision: string,
  ) {
    return this.reportCardsService.setDecision(id, decision);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportCardsService.remove(id);
  }
}

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
import { ExamsService } from './exams.service.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';
import { RecordScoreDto } from './dto/record-score.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'TEACHER')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Get()
  findAll(
    @Query('classGroupId') classGroupId?: string,
    @Query('subject') subject?: string,
  ) {
    if (classGroupId) {
      return this.examsService.findByClassGroup(Number(classGroupId));
    }
    if (subject) {
      return this.examsService.findBySubject(subject);
    }
    return this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.findById(id);
  }

  @Get(':id/scores')
  getScores(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.getExamScores(id);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.getClassGroupStats(id);
  }

  @Get('student/:studentId')
  getStudentExams(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('classGroupId') classGroupId?: string,
  ) {
    return this.examsService.getStudentExamScores(
      studentId,
      classGroupId ? Number(classGroupId) : undefined,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
  ) {
    return this.examsService.update(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.publish(id);
  }

  @Post(':id/score')
  recordScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordScoreDto,
    @CurrentUser() user: { sub: number },
  ) {
    return this.examsService.recordScore(id, dto.studentId, dto.score, user.sub);
  }

  @Post(':id/scores/bulk')
  bulkRecordScores(
    @Param('id', ParseIntPipe) id: number,
    @Body() scores: { studentId: number; score: number; comments?: string }[],
    @CurrentUser() user: { sub: number },
  ) {
    return this.examsService.bulkRecordScores(id, scores, user.sub);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examsService.remove(id);
  }
}

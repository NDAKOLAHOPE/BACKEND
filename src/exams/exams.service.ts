import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../db/entities/exam.entity.js';
import { ExamScore } from '../db/entities/exam-score.entity.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examsRepo: Repository<Exam>,
    @InjectRepository(ExamScore)
    private readonly examScoresRepo: Repository<ExamScore>,
  ) {}

  async create(dto: CreateExamDto): Promise<Exam> {
    const exam = this.examsRepo.create({
      title: dto.title,
      description: dto.description || null,
      subject: dto.subject,
      examType: dto.examType,
      classGroupId: dto.classGroupId,
      academicYearId: dto.academicYearId || null,
      examDate: dto.examDate,
      startTime: dto.startTime || null,
      endTime: dto.endTime || null,
      durationMinutes: dto.durationMinutes || null,
      maxScore: dto.maxScore || 20,
      passingScore: dto.passingScore || null,
      weight: dto.weight || 1,
      coefficient: dto.coefficient || 1,
      status: dto.status || 'DRAFT',
      instructions: dto.instructions || null,
      materialsAllowed: dto.materialsAllowed || null,
      location: dto.location || null,
      createdBy: dto.createdBy || null,
    });
    return this.examsRepo.save(exam);
  }

  async findAll(): Promise<Exam[]> {
    return this.examsRepo.find({
      relations: ['classGroup', 'academicYear'],
      order: { examDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByClassGroup(classGroupId: number): Promise<Exam[]> {
    return this.examsRepo.find({
      where: { classGroupId },
      relations: ['academicYear'],
      order: { examDate: 'DESC' },
    });
  }

  async findBySubject(subject: string): Promise<Exam[]> {
    return this.examsRepo.find({
      where: { subject },
      relations: ['classGroup', 'academicYear'],
      order: { examDate: 'DESC' },
    });
  }

  async findById(id: number): Promise<Exam> {
    const exam = await this.examsRepo.findOne({
      where: { id },
      relations: ['classGroup', 'academicYear', 'examScores', 'examScores.student'],
    });
    if (!exam) {
      throw new Error('Exam not found');
    }
    return exam;
  }

  async update(id: number, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.findById(id);
    if (dto.title !== undefined) exam.title = dto.title;
    if (dto.description !== undefined) exam.description = dto.description;
    if (dto.subject !== undefined) exam.subject = dto.subject;
    if (dto.examType !== undefined) exam.examType = dto.examType;
    if (dto.examDate !== undefined) exam.examDate = dto.examDate;
    if (dto.startTime !== undefined) exam.startTime = dto.startTime;
    if (dto.endTime !== undefined) exam.endTime = dto.endTime;
    if (dto.durationMinutes !== undefined) exam.durationMinutes = dto.durationMinutes;
    if (dto.maxScore !== undefined) exam.maxScore = dto.maxScore;
    if (dto.passingScore !== undefined) exam.passingScore = dto.passingScore;
    if (dto.weight !== undefined) exam.weight = dto.weight;
    if (dto.coefficient !== undefined) exam.coefficient = dto.coefficient;
    if (dto.status !== undefined) exam.status = dto.status;
    if (dto.instructions !== undefined) exam.instructions = dto.instructions;
    if (dto.materialsAllowed !== undefined) exam.materialsAllowed = dto.materialsAllowed;
    if (dto.location !== undefined) exam.location = dto.location;
    return this.examsRepo.save(exam);
  }

  async remove(id: number): Promise<{ success: true }> {
    const exam = await this.findById(id);
    await this.examsRepo.remove(exam);
    return { success: true };
  }

  async publish(id: number): Promise<Exam> {
    const exam = await this.findById(id);
    exam.status = 'PUBLISHED';
    return this.examsRepo.save(exam);
  }

  async getExamScores(id: number): Promise<ExamScore[]> {
    const exam = await this.findById(id);
    return exam.examScores;
  }

  async recordScore(
    examId: number,
    studentId: number,
    score: number,
    gradedBy: number,
  ): Promise<ExamScore> {
    const exam = await this.examsRepo.findOne({
      where: { id: examId },
      relations: ['examScores'],
    });
    if (!exam) {
      throw new Error('Exam not found');
    }

    const existingScore = exam.examScores.find((es) => es.studentId === studentId);
    const percentage = exam.maxScore > 0 ? (score / exam.maxScore) * 100 : 0;

    if (existingScore) {
      existingScore.score = score;
      existingScore.percentage = percentage;
      existingScore.status = 'GRADED';
      existingScore.gradedBy = gradedBy;
      existingScore.gradedAt = new Date();
      return this.examScoresRepo.save(existingScore);
    }

    const examScore = this.examScoresRepo.create({
      examId,
      studentId,
      score,
      maxPossible: exam.maxScore,
      percentage,
      status: 'GRADED',
      gradedBy,
      gradedAt: new Date(),
      isAbsent: false,
    });
    return this.examScoresRepo.save(examScore);
  }

  async bulkRecordScores(
    examId: number,
    scores: { studentId: number; score: number; comments?: string }[],
    gradedBy: number,
  ): Promise<ExamScore[]> {
    const exam = await this.examsRepo.findOne({
      where: { id: examId },
      relations: ['examScores'],
    });
    if (!exam) {
      throw new Error('Exam not found');
    }

    const savedScores: ExamScore[] = [];
    for (const item of scores) {
      const percentage = exam.maxScore > 0 ? (item.score / exam.maxScore) * 100 : 0;
      let examScore = exam.examScores.find((es) => es.studentId === item.studentId);

      if (examScore) {
        examScore.score = item.score;
        examScore.percentage = percentage;
        examScore.status = 'GRADED';
        examScore.gradedBy = gradedBy;
        examScore.gradedAt = new Date();
        examScore.comments = item.comments || null;
      } else {
        examScore = this.examScoresRepo.create({
          examId,
          studentId: item.studentId,
          score: item.score,
          maxPossible: exam.maxScore,
          percentage,
          status: 'GRADED',
          comments: item.comments || null,
          gradedBy,
          gradedAt: new Date(),
          isAbsent: false,
        });
      }
      savedScores.push(await this.examScoresRepo.save(examScore));
    }

    return savedScores;
  }

  async getStudentExamScores(studentId: number, classGroupId?: number): Promise<ExamScore[]> {
    const query = this.examScoresRepo.createQueryBuilder('examScore')
      .where('examScore.studentId = :studentId', { studentId })
      .leftJoinAndSelect('examScore.exam', 'exam');

    if (classGroupId) {
      query.andWhere('exam.classGroupId = :classGroupId', { classGroupId });
    }

    return query.orderBy('exam.examDate', 'DESC').getMany();
  }

  async getClassGroupStats(examId: number): Promise<any> {
    const exam = await this.findById(examId);
    const scores = exam.examScores;

    if (scores.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, passingRate: 0 };
    }

    const numericScores = scores.map((s) => Number(s.score)).filter((s) => !isNaN(s));
    const sum = numericScores.reduce((a, b) => a + b, 0);
    const average = sum / numericScores.length;
    const min = Math.min(...numericScores);
    const max = Math.max(...numericScores);
    const passing = numericScores.filter((s) => (exam.passingScore ? s >= exam.passingScore : s >= 10)).length;
    const passingRate = (passing / numericScores.length) * 100;

    return {
      average: parseFloat(average.toFixed(2)),
      min,
      max,
      count: numericScores.length,
      passingRate: parseFloat(passingRate.toFixed(2)),
    };
  }
}

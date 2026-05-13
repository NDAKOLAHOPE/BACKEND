import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCard } from '../db/entities/report-card.entity.js';
import { ExamScore } from '../db/entities/exam-score.entity.js';
import { Student } from '../db/entities/student.entity.js';
import { Attendance } from '../db/entities/attendance.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { Enrollment } from '../db/entities/enrollment.entity.js';
import { GenerateReportCardsDto } from './dto/generate-report-cards.dto.js';
import { UpdateReportCardDto } from './dto/update-report-card.dto.js';

@Injectable()
export class ReportCardsService {
  constructor(
    @InjectRepository(ReportCard)
    private readonly reportCardsRepo: Repository<ReportCard>,
    @InjectRepository(ExamScore)
    private readonly examScoresRepo: Repository<ExamScore>,
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepo: Repository<Enrollment>,
  ) {}

  async generateReportCards(
    dto: GenerateReportCardsDto,
  ): Promise<{ generated: number; reportCards: ReportCard[] }> {
    const { academicYearId, classGroupId, term } = dto;
    const generatedBy = dto.generatedBy || null;

    // Get students for the class group (or all if not specified)
    let students;
    if (classGroupId) {
      const enrollments = await this.enrollmentsRepo.find({
        where: { classGroupId, academicYearId, status: 'CONFIRMED' },
        relations: ['student'],
      });
      students = enrollments.map((e) => e.student);
    } else {
      students = await this.studentsRepo.find();
    }

    const reportCards: ReportCard[] = [];

    for (const student of students) {
      // Get all exam scores for this student in the academic year
      const examScores = await this.examScoresRepo.find({
        where: { studentId: student.id },
        relations: ['exam'],
      });

      // Filter by academic year if specified
      const filteredScores = examScores.filter((es) => {
        if (!es.exam) return false;
        if (academicYearId && es.exam.academicYearId !== academicYearId) {
          return false;
        }
        return true;
      });

      if (filteredScores.length === 0) {
        continue;
      }

      // Calculate averages
      const totalScore = filteredScores.reduce((sum, es) => {
        const score = Number(es.score) || 0;
        const maxScore = Number(es.exam?.maxScore) || 20;
        return sum + (score / maxScore) * 20;
      }, 0);

      const average = totalScore / filteredScores.length;
      const maxPossible = 20 * filteredScores.length;
      const percentage = (totalScore / maxPossible) * 100;

      // Get attendance stats
       const attendanceStats = await this.attendanceRepo
         .createQueryBuilder('attendance')
         .where('attendance.studentId = :studentId', { studentId: student.id })
         .andWhere('attendance.date BETWEEN :start AND :end', {
           start: new Date(academicYearId ? `${academicYearId}-01-01` : '2000-01-01'),
           end: new Date(academicYearId ? `${academicYearId}-12-31` : '2100-12-31'),
         })
         .select(['status', 'COUNT(*) as count'])
         .groupBy('status')
         .getRawMany();

      let daysPresent = 0, daysAbsent = 0;
      for (const stat of attendanceStats) {
        if (stat.status === 'PRESENT' || stat.status === 'LATE') {
          daysPresent += Number(stat.count);
        } else {
          daysAbsent += Number(stat.count);
        }
      }
      const totalAttendanceDays = daysPresent + daysAbsent;
      const attendancePercentage = totalAttendanceDays > 0 ? (daysPresent / totalAttendanceDays) * 100 : 0;

      // Calculate class rank
      const allReportCards = await this.reportCardsRepo.find({
        where: { academicYearId, term },
        relations: ['student'],
      });
      allReportCards.sort((a, b) => b.average - a.average);
      const classRank = allReportCards.findIndex((rc) => rc.studentId === student.id) + 1;

      // Determine decision
      let decision: 'PROMOTED' | 'RETAINED' | 'GRADUATED' | 'UNDECIDED' = 'UNDECIDED';
      if (average >= 10 && attendancePercentage >= 75) {
        decision = 'PROMOTED';
      } else if (average < 8 || attendancePercentage < 50) {
        decision = 'RETAINED';
      }

      const reportCard = this.reportCardsRepo.create({
        studentId: student.id,
        academicYearId,
        classGroupId: classGroupId || null,
        term,
        totalScore,
        average,
        maxPossible,
        percentage,
        classRank,
        classSize: allReportCards.length,
        attendanceDaysPresent: daysPresent,
        attendanceDaysAbsent: daysAbsent,
        attendancePercentage,
        status: 'DRAFT',
        decision,
        generatedBy,
      });

      const saved = await this.reportCardsRepo.save(reportCard);
      reportCards.push(saved);
    }

    return { generated: reportCards.length, reportCards };
  }

  async findAll(): Promise<ReportCard[]> {
    return this.reportCardsRepo.find({
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<ReportCard[]> {
    return this.reportCardsRepo.find({
      where: { studentId },
      relations: ['student'],
      order: { academicYearId: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByParent(parentId: number): Promise<ReportCard[]> {
    const studentLinks = await this.studentParentsRepo.find({
      where: { parentId },
      relations: ['student'],
    });
    const studentIds = studentLinks.map((link) => link.studentId);
    if (studentIds.length === 0) return [];

    return this.reportCardsRepo.find({
      where: { studentId: studentIds as any },
      relations: ['student'],
      order: { academicYearId: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByAcademicYear(academicYearId: number): Promise<ReportCard[]> {
    return this.reportCardsRepo.find({
      where: { academicYearId },
      relations: ['student', 'examScores', 'examScores.exam'],
      order: { average: 'DESC' },
    });
  }

  async findById(id: number): Promise<ReportCard> {
    const reportCard = await this.reportCardsRepo.findOne({
      where: { id },
      relations: ['student', 'examScores', 'examScores.exam'],
    });
    if (!reportCard) {
      throw new Error('Report card not found');
    }
    return reportCard;
  }

  async publish(id: number): Promise<ReportCard> {
    const reportCard = await this.findById(id);
    reportCard.status = 'PUBLISHED';
    reportCard.publishedAt = new Date();
    return this.reportCardsRepo.save(reportCard);
  }

  async addComments(
    id: number,
    teacherComments: string,
    principalComments?: string,
  ): Promise<ReportCard> {
    const reportCard = await this.findById(id);
    reportCard.teacherComments = teacherComments;
    if (principalComments !== undefined) {
      reportCard.principalComments = principalComments;
    }
    return this.reportCardsRepo.save(reportCard);
  }

  async setDecision(id: number, decision: string): Promise<ReportCard> {
    const reportCard = await this.findById(id);
    reportCard.decision = decision as any;
    return this.reportCardsRepo.save(reportCard);
  }

  async getStudentLatestReportCard(studentId: number): Promise<ReportCard | null> {
    return this.reportCardsRepo.findOne({
      where: { studentId },
      order: { academicYearId: 'DESC', createdAt: 'DESC' },
    });
  }

  async getStatistics(academicYearId?: number): Promise<any> {
    const query = this.reportCardsRepo.createQueryBuilder('reportCard');
    if (academicYearId) {
      query.where('reportCard.academicYearId = :academicYearId', { academicYearId });
    }
    const reportCards = await query.getMany();

    const total = reportCards.length;
    const passing = reportCards.filter((rc) => rc.average >= 10).length;
    const averages = reportCards.map((rc) => Number(rc.average));
    const classAverage = averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;

    return {
      totalStudents: total,
      passingCount: passing,
      failingCount: total - passing,
      passRate: total > 0 ? (passing / total) * 100 : 0,
      classAverage: parseFloat(classAverage.toFixed(2)),
      promotedCount: reportCards.filter((rc) => rc.decision === 'PROMOTED').length,
      retainedCount: reportCards.filter((rc) => rc.decision === 'RETAINED').length,
    };
  }

  async update(id: number, dto: UpdateReportCardDto): Promise<ReportCard> {
    const reportCard = await this.findById(id);
    if (dto.totalScore !== undefined) reportCard.totalScore = dto.totalScore;
    if (dto.average !== undefined) reportCard.average = dto.average;
    if (dto.percentage !== undefined) reportCard.percentage = dto.percentage;
    if (dto.classRank !== undefined) reportCard.classRank = dto.classRank;
    if (dto.teacherComments !== undefined) reportCard.teacherComments = dto.teacherComments;
    if (dto.principalComments !== undefined) reportCard.principalComments = dto.principalComments;
    if (dto.remarks !== undefined) reportCard.remarks = dto.remarks;
    if (dto.status !== undefined) reportCard.status = dto.status;
    if (dto.decision !== undefined) reportCard.decision = dto.decision;
    return this.reportCardsRepo.save(reportCard);
  }

  async remove(id: number): Promise<{ success: true }> {
    const reportCard = await this.findById(id);
    await this.reportCardsRepo.remove(reportCard);
    return { success: true };
  }

  async exportToPDF(id: number): Promise<string> {
    const reportCard = await this.findById(id);
    return `Report card for student ${reportCard.studentId} generated`;
  }
}

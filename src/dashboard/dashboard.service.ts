import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../db/entities/student.entity.js';
import { User } from '../db/entities/user.entity.js';
import { Grade } from '../db/entities/grade.entity.js';
import { Payment, PaymentType } from '../db/entities/payment.entity.js';
import { ParentMessage } from '../db/entities/parent-message.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { Attendance } from '../db/entities/attendance.entity.js';
import { Exam } from '../db/entities/exam.entity.js';
import { ExamScore } from '../db/entities/exam-score.entity.js';
import { ReportCard } from '../db/entities/report-card.entity.js';
import { Enrollment } from '../db/entities/enrollment.entity.js';
import { ClassGroup } from '../db/entities/class-group.entity.js';
import { AcademicYear } from '../db/entities/academic-year.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Grade) private readonly gradesRepo: Repository<Grade>,
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<PaymentType>,
    @InjectRepository(ParentMessage)
    private readonly messagesRepo: Repository<ParentMessage>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Exam)
    private readonly examsRepo: Repository<Exam>,
    @InjectRepository(ExamScore)
    private readonly examScoresRepo: Repository<ExamScore>,
    @InjectRepository(ReportCard)
    private readonly reportCardsRepo: Repository<ReportCard>,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepo: Repository<Enrollment>,
    @InjectRepository(ClassGroup)
    private readonly classGroupsRepo: Repository<ClassGroup>,
    @InjectRepository(AcademicYear)
    private readonly academicYearsRepo: Repository<AcademicYear>,
  ) {}

  async summary() {
    const [
      studentsCount,
      usersCount,
      payments,
      studentsByStatus,
      classGroupsCount,
      academicYearsCount,
      examsCount,
      reportCardsCount,
      avgAttendanceRate,
      avgExamScore,
    ] = await Promise.all([
      this.studentsRepo.count(),
      this.usersRepo.count(),
      this.paymentsRepo
        .createQueryBuilder('p')
        .select('p.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('p.status')
        .getRawMany<{ status: string; count: string }>(),
      this.studentsRepo
        .createQueryBuilder('s')
        .select('s.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('s.status')
        .getRawMany<{ status: string; count: string }>(),
      this.classGroupsRepo.count(),
      this.academicYearsRepo.count(),
      this.examsRepo.count(),
      this.reportCardsRepo.count(),
      this.attendanceRepo
        .createQueryBuilder('a')
        .select('AVG(CASE WHEN a.status IN (:...presentStatuses) THEN 100.0 ELSE 0.0 END)', 'rate')
        .setParameter('presentStatuses', ['PRESENT', 'LATE'])
        .getRawOne<{ rate: string }>(),
      this.examScoresRepo
        .createQueryBuilder('es')
        .select('AVG(es.percentage)', 'avg')
        .getRawOne<{ avg: string }>(),
    ]);

    const paidCount = Number(
      payments.find((p) => p.status === 'PAID')?.count ?? 0,
    );
    const pendingCount = Number(
      payments.find((p) => p.status === 'PENDING')?.count ?? 0,
    );

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const messagesRecentCount = await this.messagesRepo
      .createQueryBuilder('m')
      .where('m.createdAt > :since', { since: last7Days })
      .getCount();

    const avgScoreRaw = await this.gradesRepo
      .createQueryBuilder('g')
      .select('AVG(g.score)', 'avg')
      .getRawOne<{ avg: string | null }>();

    // Format students by status
    const studentsByStatusMap: Record<string, number> = {};
    for (const item of studentsByStatus) {
      studentsByStatusMap[item.status] = Number(item.count);
    }

    // Get current academic year
    const currentAcademicYear = await this.academicYearsRepo.findOne({
      where: { isCurrent: true },
    });

    // Get recent exam stats
    const recentExams = await this.examsRepo
      .createQueryBuilder('e')
      .where('e.status = :status', { status: 'PUBLISHED' })
      .andWhere('e.examDate >= :since', {
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .getCount();

    // Get report cards by status
    const [publishedReportCards, draftReportCards] = await Promise.all([
      this.reportCardsRepo.count({ where: { status: 'PUBLISHED' } }),
      this.reportCardsRepo.count({ where: { status: 'DRAFT' } }),
    ]);

    return {
      // Existing stats
      studentsCount,
      usersCount,
      payments: { paidCount, pendingCount },
      messagesRecentCount,
      grades: {
        avgScore: avgScoreRaw?.avg ? Number(avgScoreRaw.avg) : null,
      },
      // New academic stats
      studentsByStatus: studentsByStatusMap,
      classGroupsCount,
      academicYearsCount: academicYearsCount,
      academicYearCurrent: currentAcademicYear?.name || null,
      exams: {
        total: examsCount,
        recent: recentExams,
      },
      reportCards: {
        total: reportCardsCount,
        published: publishedReportCards,
        draft: draftReportCards,
      },
      attendance: {
        averageRate: avgAttendanceRate?.rate ? parseFloat(avgAttendanceRate.rate) : null,
      },
      academics: {
        averageExamScore: avgExamScore?.avg ? parseFloat(avgExamScore.avg) : null,
      },
    };
  }

  async parentSummary(parentId: number) {
    const children = await this.studentParentsRepo.find({
      where: { parentId },
      relations: ['student', 'student.grades', 'student.payments'],
    });

    const studentIds = children.map((c) => c.studentId);
    const [childrenCount, pendingPaymentsCount] = await Promise.all([
      Promise.resolve(children.length),
      this.paymentsRepo
        .createQueryBuilder('p')
        .where('p.studentId IN (:...ids)', { ids: studentIds })
        .andWhere('p.status = :status', { status: 'PENDING' })
        .getCount(),
    ]);

    const childrenData = children.map((c) => ({
      id: c.student.id,
      firstName: c.student.firstName,
      lastName: c.student.lastName,
      className: c.student.className,
    }));

    return {
      childrenCount,
      pendingPaymentsCount,
      children: childrenData,
    };
  }
}

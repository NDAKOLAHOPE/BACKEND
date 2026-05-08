import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../db/entities/student.entity.js';
import { User } from '../db/entities/user.entity.js';
import { Grade } from '../db/entities/grade.entity.js';
import { Payment, PaymentType } from '../db/entities/payment.entity.js';
import { ParentMessage } from '../db/entities/parent-message.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student) private readonly studentsRepo: Repository<Student>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Grade) private readonly gradesRepo: Repository<Grade>,
    @InjectRepository(Payment) private readonly paymentsRepo: Repository<PaymentType>,
    @InjectRepository(ParentMessage)
    private readonly messagesRepo: Repository<ParentMessage>,
  ) {}

  async summary() {
    const [studentsCount, usersCount, payments] = await Promise.all([
      this.studentsRepo.count(),
      this.usersRepo.count(),
      this.paymentsRepo
        .createQueryBuilder('p')
        .select('p.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('p.status')
        .getRawMany<{ status: string; count: string }>(),
    ]);

    const paidCount = Number(payments.find((p) => p.status === 'PAID')?.count ?? 0);
    const pendingCount = Number(payments.find((p) => p.status === 'PENDING')?.count ?? 0);

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const messagesRecentCount = await this.messagesRepo
      .createQueryBuilder('m')
      .where('m.createdAt > :since', { since: last7Days })
      .getCount();

    const avgScoreRaw = await this.gradesRepo
      .createQueryBuilder('g')
      .select('AVG(g.score)', 'avg')
      .getRawOne<{ avg: string | null }>();

    return {
      studentsCount,
      usersCount,
      payments: { paidCount, pendingCount },
      messagesRecentCount,
      grades: { avgScore: avgScoreRaw?.avg ? Number(avgScoreRaw.avg) : null },
    };
  }
}


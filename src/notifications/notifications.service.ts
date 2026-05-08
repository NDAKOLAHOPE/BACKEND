import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { Payment, PaymentType } from '../db/entities/payment.entity.js';
import { ParentMessage } from '../db/entities/parent-message.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<PaymentType>,
    @InjectRepository(ParentMessage)
    private readonly messagesRepo: Repository<ParentMessage>,
  ) {}

  async summaryForUser(role: string, userId: number) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (role === 'PARENT') {
      const links = await this.studentParentsRepo.find({
        where: { parentId: userId },
      });
      const studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) {
        return { pendingPayments: 0, recentMessages: 0 };
      }

      const pendingPayments = await this.paymentsRepo
        .createQueryBuilder('p')
        .where('p.studentId IN (:...ids)', { ids: studentIds })
        .andWhere('p.status = :status', { status: 'PENDING' })
        .getCount();

      const recentMessages = await this.messagesRepo
        .createQueryBuilder('m')
        .where('m.parentId = :pid', { pid: userId })
        .andWhere('m.createdAt > :since', { since })
        .getCount();

      return { pendingPayments, recentMessages };
    }

    const pendingPayments = await this.paymentsRepo.count({
      where: { status: 'PENDING' },
    } as any);
    const recentMessages = await this.messagesRepo
      .createQueryBuilder('m')
      .where('m.createdAt > :since', { since })
      .getCount();

    return { pendingPayments, recentMessages };
  }
}

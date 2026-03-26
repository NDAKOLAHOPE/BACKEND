import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from '../db/entities/payment.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentsRepo.create({
      studentId: dto.studentId,
      amount: dto.amount,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
      status: dto.status ?? 'PENDING',
    });
    return this.paymentsRepo.save(payment);
  }

  async updateStatus(id: number, dto: UpdatePaymentStatusDto): Promise<Payment> {
    const payment = await this.paymentsRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = dto.status;
    return this.paymentsRepo.save(payment);
  }

  async listForRole(options: { role: string; studentId?: number; parentId?: number }): Promise<Payment[]> {
    const { role, studentId, parentId } = options;

    if (role === 'PARENT') {
      if (!parentId) throw new ForbiddenException('Missing parent id');
      const links = await this.studentParentsRepo.find({ where: { parentId } });
      const studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) return [];

      const where: any = {};
      where.studentId = studentId !== undefined ? (studentIds.includes(studentId) ? In([studentId]) : In([])) : In(studentIds);
      return this.paymentsRepo.find({ where, order: { id: 'DESC' } });
    }

    const where: any = {};
    if (studentId !== undefined) where.studentId = studentId;
    return this.paymentsRepo.find({ where, order: { id: 'DESC' } });
  }
}


import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment, PaymentType } from '../db/entities/payment.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentsRepo: Repository<PaymentType>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
  ) {}

  async create(dto: CreatePaymentDto, role: string): Promise<PaymentType> {
    const payment = this.paymentsRepo.create({
      studentId: dto.studentId,
      amount: dto.amount,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
      status: role === 'ADMIN' ? dto.status ?? 'PENDING' : 'PENDING',
    });
    return this.paymentsRepo.save(payment);
  }

  async updateStatus(id: number, dto: UpdatePaymentStatusDto): Promise<PaymentType> {
    const payment = await this.paymentsRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = dto.status;
    return this.paymentsRepo.save(payment);
  }

  async update(id: number, dto: CreatePaymentDto, role: string): Promise<PaymentType> {
    const payment = await this.paymentsRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.studentId = dto.studentId;
    payment.amount = dto.amount;
    payment.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : null;
    if (role === 'ADMIN' && dto.status) {
      payment.status = dto.status;
    }
    return this.paymentsRepo.save(payment);
  }

  async remove(id: number): Promise<{ success: true }> {
    const payment = await this.paymentsRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.paymentsRepo.remove(payment);
    return { success: true };
  }

  async listForRole(options: { role: string; studentId?: number; parentId?: number }): Promise<PaymentType[]> {
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


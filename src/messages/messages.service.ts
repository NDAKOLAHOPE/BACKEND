import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ParentMessage } from '../db/entities/parent-message.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { CreateMessageDto } from './dto/create-message.dto.js';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(ParentMessage)
    private readonly messagesRepo: Repository<ParentMessage>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
  ) {}

  async create(dto: CreateMessageDto, role: string, userId: number): Promise<ParentMessage> {
    const parentId = role === 'PARENT' ? userId : dto.parentId;
    if (!parentId) throw new ForbiddenException('Missing parentId');

    if (role === 'PARENT') {
      await this.ensureParentOfStudent(userId, dto.studentId);
    }

    const msg = this.messagesRepo.create({
      studentId: dto.studentId,
      parentId,
      message: dto.message,
    });
    return this.messagesRepo.save(msg);
  }

  async listForRole(options: { role: string; studentId?: number; parentId?: number }): Promise<ParentMessage[]> {
    const { role, studentId, parentId } = options;

    if (role === 'PARENT') {
      if (!parentId) throw new ForbiddenException('Missing parentId');
      const links = await this.studentParentsRepo.find({ where: { parentId } });
      const studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) return [];

      const where: any = { studentId: In(studentIds) };
      if (studentId !== undefined) {
        if (!studentIds.includes(studentId)) throw new ForbiddenException('Not allowed');
        where.studentId = studentId;
      }

      return this.messagesRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    const where: any = {};
    if (studentId !== undefined) where.studentId = studentId;
    return this.messagesRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  private async ensureParentOfStudent(parentId: number, studentId: number): Promise<void> {
    const link = await this.studentParentsRepo.findOne({ where: { parentId, studentId } });
    if (!link) throw new ForbiddenException('Not allowed');
  }
}


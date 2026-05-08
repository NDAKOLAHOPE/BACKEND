import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Progress } from '../db/entities/progress.entity.js';
import { Student } from '../db/entities/student.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { CreateProgressDto } from './dto/create-progress.dto.js';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepo: Repository<Progress>,
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
  ) {}

  async create(
    dto: CreateProgressDto,
    role: string,
    userId: number,
  ): Promise<Progress> {
    const studentId = dto.studentId;

    const student = await this.studentsRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    if (role === 'PARENT') {
      const link = await this.studentParentsRepo.findOne({
        where: { parentId: userId, studentId },
      });
      if (!link) throw new ForbiddenException('Not allowed');
    }

    const noteToSave = dto._clear !== undefined ? null : dto.note;
    const item = this.progressRepo.create({
      studentId,
      note: noteToSave,
    });
    return this.progressRepo.save(item);
  }

  async listForRole(options: {
    role: string;
    userId?: number;
    studentId?: number;
  }): Promise<Progress[]> {
    const { role, userId, studentId } = options;

    if (role === 'PARENT') {
      if (!userId) throw new ForbiddenException('Missing parent id');

      const links = await this.studentParentsRepo.find({
        where: { parentId: userId },
      });
      const studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) return [];

      if (studentId !== undefined) {
        return this.progressRepo.find({
          where: { studentId: In([studentId]) },
          order: { createdAt: 'DESC' },
        });
      }

      return this.progressRepo.find({
        where: { studentId: In(studentIds) },
        order: { createdAt: 'DESC' },
      });
    }

    const where: any = {};
    if (studentId !== undefined) where.studentId = studentId;
    return this.progressRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async listMy(parentId: number): Promise<Progress[]> {
    const links = await this.studentParentsRepo.find({ where: { parentId } });
    const studentIds = links.map((l) => l.studentId);
    if (studentIds.length === 0) return [];

    return this.progressRepo.find({
      where: { studentId: In(studentIds) },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    dto: CreateProgressDto,
    role: string,
    userId: number,
  ): Promise<Progress> {
    const item = await this.progressRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Progress not found');
    if (role === 'PARENT') {
      const link = await this.studentParentsRepo.findOne({
        where: { parentId: userId, studentId: item.studentId },
      });
      if (!link) throw new ForbiddenException('Not allowed');
    }
    item.note = dto._clear !== undefined ? null : dto.note;
    return this.progressRepo.save(item);
  }

  async remove(
    id: number,
    role: string,
    userId: number,
  ): Promise<{ success: true }> {
    const item = await this.progressRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Progress not found');
    if (role === 'PARENT') {
      const link = await this.studentParentsRepo.findOne({
        where: { parentId: userId, studentId: item.studentId },
      });
      if (!link) throw new ForbiddenException('Not allowed');
    }
    await this.progressRepo.remove(item);
    return { success: true };
  }
}

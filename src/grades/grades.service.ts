import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Grade } from '../db/entities/grade.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { CreateGradeDto } from './dto/create-grade.dto.js';
import { UpdateGradeDto } from './dto/update-grade.dto.js';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade) private readonly gradesRepo: Repository<Grade>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
  ) {}

  async create(dto: CreateGradeDto): Promise<Grade> {
    const grade = this.gradesRepo.create({
      studentId: dto.studentId,
      subject: dto.subject,
      score: dto.score,
      term: dto.term ?? null,
    });
    return this.gradesRepo.save(grade);
  }

  async update(id: number, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.gradesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Grade not found');
    if (dto.subject !== undefined) grade.subject = dto.subject;
    if (dto.score !== undefined) grade.score = dto.score;
    if (dto.term !== undefined) grade.term = dto.term ?? null;
    return this.gradesRepo.save(grade);
  }

  async remove(id: number): Promise<{ success: true }> {
    const grade = await this.gradesRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Grade not found');
    await this.gradesRepo.remove(grade);
    return { success: true };
  }

  async listForRole(options: {
    role: string;
    studentId?: number;
    parentId?: number;
  }): Promise<Grade[]> {
    const { role, studentId, parentId } = options;

    if (role === 'PARENT') {
      if (!parentId) throw new ForbiddenException('Missing parent id');

      const links = await this.studentParentsRepo.find({ where: { parentId } });
      const studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) return [];

      const where: any = {};
      if (studentId !== undefined) {
        where.studentId = studentIds.includes(studentId)
          ? In([studentId])
          : In([]);
      } else {
        where.studentId = In(studentIds);
      }

      return this.gradesRepo.find({ where, order: { createdAt: 'DESC' } });
    }

    const where: any = {};
    if (studentId !== undefined) where.studentId = studentId;
    return this.gradesRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async analyticsTerms(options: {
    role: string;
    parentId?: number;
    studentId?: number;
    term?: string;
  }): Promise<Array<{ term: string; avg: number }>> {
    const { role, parentId, studentId, term } = options;

    let studentIds: number[] | null = null;

    if (role === 'PARENT') {
      if (!parentId) throw new ForbiddenException('Missing parent id');
      const links = await this.studentParentsRepo.find({ where: { parentId } });
      studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) return [];
    }

    if (role !== 'PARENT' && studentId !== undefined) {
      studentIds = [studentId];
    }

    const qb = this.gradesRepo
      .createQueryBuilder('g')
      .select('g.term', 'term')
      .addSelect('AVG(g.score)', 'avg')
      .where('g.term IS NOT NULL');

    if (term) qb.andWhere('g.term = :term', { term });

    if (studentIds)
      qb.andWhere('g.studentId IN (:...ids)', { ids: studentIds });

    qb.groupBy('g.term').orderBy('g.term', 'ASC');

    const rows = await qb.getRawMany<{ term: string; avg: string }>();
    return rows.map((r) => ({
      term: r.term,
      avg: Number(r.avg),
    }));
  }
}

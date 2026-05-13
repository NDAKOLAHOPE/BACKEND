import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassGroup } from '../db/entities/class-group.entity.js';
import { CreateClassGroupDto } from './dto/create-class-group.dto.js';
import { UpdateClassGroupDto } from './dto/update-class-group.dto.js';

@Injectable()
export class ClassGroupsService {
  constructor(
    @InjectRepository(ClassGroup)
    private readonly classGroupsRepo: Repository<ClassGroup>,
  ) {}

  async create(dto: CreateClassGroupDto): Promise<ClassGroup> {
    const classGroup = this.classGroupsRepo.create({
      name: dto.name,
      level: dto.level,
      section: dto.section || null,
      academicYearId: dto.academicYearId,
    });
    if (dto.classTeacherId) {
      classGroup.classTeacher = { id: dto.classTeacherId } as any;
    }
    return this.classGroupsRepo.save(classGroup);
  }

  async findAll(): Promise<ClassGroup[]> {
    return this.classGroupsRepo.find({
      relations: ['academicYear'],
      order: { name: 'ASC' },
    });
  }

  async findByAcademicYear(academicYearId: number): Promise<ClassGroup[]> {
    return this.classGroupsRepo.find({
      where: { academicYearId },
      relations: ['academicYear'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<ClassGroup> {
    const classGroup = await this.classGroupsRepo.findOne({
      where: { id },
      relations: ['academicYear', 'enrollments', 'enrollments.student'],
    });
    if (!classGroup) {
      throw new Error('Class group not found');
    }
    return classGroup;
  }

  async update(id: number, dto: UpdateClassGroupDto): Promise<ClassGroup> {
    const classGroup = await this.findById(id);
    if (dto.name !== undefined) classGroup.name = dto.name;
    if (dto.level !== undefined) classGroup.level = dto.level;
    if (dto.section !== undefined) classGroup.section = dto.section;
    if (dto.academicYearId !== undefined) classGroup.academicYearId = dto.academicYearId;
    if (dto.classTeacherId !== undefined) {
      classGroup.classTeacher = dto.classTeacherId ? { id: dto.classTeacherId } as any : null;
    }
    return this.classGroupsRepo.save(classGroup);
  }

  async remove(id: number): Promise<{ success: true }> {
    const classGroup = await this.findById(id);
    await this.classGroupsRepo.remove(classGroup);
    return { success: true };
  }

  async getStudents(id: number): Promise<any[]> {
    const classGroup = await this.findById(id);
    return classGroup.enrollments.map((e) => e.student);
  }
}

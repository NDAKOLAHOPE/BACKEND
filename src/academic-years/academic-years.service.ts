import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from '../db/entities/academic-year.entity.js';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearsRepo: Repository<AcademicYear>,
  ) {}

  async create(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    const academicYear = this.academicYearsRepo.create({
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status || 'ACTIVE',
      isCurrent: dto.isCurrent || false,
      description: dto.description || null,
    });
    return this.academicYearsRepo.save(academicYear);
  }

  async findAll(): Promise<AcademicYear[]> {
    return this.academicYearsRepo.find({
      order: { startDate: 'DESC' },
    });
  }

  async findById(id: number): Promise<AcademicYear> {
    const academicYear = await this.academicYearsRepo.findOne({
      where: { id },
      relations: ['classGroups', 'enrollments'],
    });
    if (!academicYear) {
      throw new Error('Academic year not found');
    }
    return academicYear;
  }

  async update(id: number, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const academicYear = await this.findById(id);
    if (dto.name !== undefined) academicYear.name = dto.name;
    if (dto.startDate !== undefined) academicYear.startDate = dto.startDate;
    if (dto.endDate !== undefined) academicYear.endDate = dto.endDate;
    if (dto.status !== undefined) academicYear.status = dto.status;
    if (dto.isCurrent !== undefined) academicYear.isCurrent = dto.isCurrent;
    if (dto.description !== undefined) academicYear.description = dto.description;
    return this.academicYearsRepo.save(academicYear);
  }

  async remove(id: number): Promise<{ success: true }> {
    const academicYear = await this.findById(id);
    await this.academicYearsRepo.remove(academicYear);
    return { success: true };
  }

  async setCurrent(id: number): Promise<AcademicYear> {
    // Reset all academic years to not current
    await this.academicYearsRepo.update(
      { isCurrent: true },
      { isCurrent: false },
    );
    // Set the specified one as current
    const academicYear = await this.findById(id);
    academicYear.isCurrent = true;
    return this.academicYearsRepo.save(academicYear);
  }

  async getCurrent(): Promise<AcademicYear | null> {
    return this.academicYearsRepo.findOne({
      where: { isCurrent: true },
    });
  }
}

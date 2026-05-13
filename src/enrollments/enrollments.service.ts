import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../db/entities/enrollment.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';

type EnrollmentType = 'NEW' | 'RETURNING' | 'TRANSFER' | 'EXCHANGE';
type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'EXEMPT';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepo: Repository<Enrollment>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
  ) {}

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = this.enrollmentsRepo.create({
      studentId: Number(dto.studentId),
      academicYearId: Number(dto.academicYearId),
      classGroupId: dto.classGroupId ? Number(dto.classGroupId) : null,
      enrollmentType: (dto.enrollmentType || 'NEW') as EnrollmentType,
      tuitionFee: dto.tuitionFee ?? null,
      paymentStatus: (dto.paymentStatus || 'UNPAID') as PaymentStatus,
      status: (dto.status || 'CONFIRMED') as EnrollmentStatus,
      notes: dto.notes || null,
    });
    return this.enrollmentsRepo.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentsRepo.find({
      relations: ['student', 'academicYear', 'classGroup'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepo.find({
      where: { studentId },
      relations: ['academicYear', 'classGroup'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByParent(parentId: number): Promise<Enrollment[]> {
    // Get students linked to this parent
    const studentLinks = await this.studentParentsRepo.find({
      where: { parentId },
      relations: ['student'],
    });
    const studentIds = studentLinks.map((link) => link.studentId);
    if (studentIds.length === 0) return [];

    return this.enrollmentsRepo.find({
      where: { studentId: studentIds as any },
      relations: ['student', 'academicYear', 'classGroup'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAcademicYear(academicYearId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepo.find({
      where: { academicYearId },
      relations: ['student', 'classGroup'],
      order: { student: { lastName: 'ASC' } },
    });
  }

  async findByClassGroup(classGroupId: number): Promise<Enrollment[]> {
    return this.enrollmentsRepo.find({
      where: { classGroupId },
      relations: ['student', 'academicYear'],
      order: { student: { lastName: 'ASC' } },
    });
  }

  async findById(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepo.findOne({
      where: { id },
      relations: ['student', 'academicYear', 'classGroup'],
    });
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    return enrollment;
  }

  async update(id: number, dto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findById(id);
    if (dto.studentId !== undefined) enrollment.studentId = Number(dto.studentId);
    if (dto.academicYearId !== undefined) enrollment.academicYearId = Number(dto.academicYearId);
    if (dto.classGroupId !== undefined) enrollment.classGroupId = dto.classGroupId ? Number(dto.classGroupId) : null;
    if (dto.enrollmentType !== undefined) enrollment.enrollmentType = dto.enrollmentType as EnrollmentType;
    if (dto.tuitionFee !== undefined) enrollment.tuitionFee = dto.tuitionFee ?? null;
    if (dto.paymentStatus !== undefined) enrollment.paymentStatus = dto.paymentStatus as PaymentStatus;
    if (dto.status !== undefined) enrollment.status = dto.status as EnrollmentStatus;
    if (dto.notes !== undefined) enrollment.notes = dto.notes;
    return this.enrollmentsRepo.save(enrollment);
  }

  async remove(id: number): Promise<{ success: true }> {
    const enrollment = await this.findById(id);
    await this.enrollmentsRepo.remove(enrollment);
    return { success: true };
  }

  async getStudentCurrentEnrollment(studentId: number): Promise<Enrollment | null> {
    return this.enrollmentsRepo.findOne({
      where: {
        studentId,
        status: 'CONFIRMED',
      },
      relations: ['academicYear', 'classGroup'],
      order: { createdAt: 'DESC' },
    });
  }

  async transferEnrollment(enrollmentId: number, newClassGroupId: number): Promise<Enrollment> {
    const currentEnrollment = await this.findById(enrollmentId);
    if (!currentEnrollment) {
      throw new Error('Enrollment not found');
    }

    // Update current enrollment to COMPLETED/TRANSFERRED
    currentEnrollment.status = 'COMPLETED';
    await this.enrollmentsRepo.save(currentEnrollment);

    // Create new enrollment
    const newEnrollment = this.enrollmentsRepo.create({
      studentId: currentEnrollment.studentId,
      academicYearId: currentEnrollment.academicYearId,
      classGroupId: newClassGroupId,
      enrollmentType: 'TRANSFER',
      tuitionFee: currentEnrollment.tuitionFee,
      paymentStatus: currentEnrollment.paymentStatus,
      status: 'CONFIRMED',
    });
    return this.enrollmentsRepo.save(newEnrollment);
  }
}

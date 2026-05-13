import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance } from '../db/entities/attendance.entity.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepo.create({
      studentId: dto.studentId,
      date: dto.date,
      status: dto.status || 'PRESENT',
      attendanceType: dto.attendanceType || 'DAILY',
      classGroupId: dto.classGroupId || null,
      checkInTime: dto.checkInTime || null,
      checkOutTime: dto.checkOutTime || null,
      lateMinutes: dto.lateMinutes || 0,
      reason: dto.reason || null,
      isExcused: dto.isExcused || false,
      notes: dto.notes || null,
      recordedBy: dto.recordedBy || null,
    });
    return this.attendanceRepo.save(attendance);
  }

  async createBulk(attendances: CreateAttendanceDto[]): Promise<Attendance[]> {
    const entities = attendances.map((dto) =>
      this.attendanceRepo.create({
        studentId: dto.studentId,
        date: dto.date,
        status: dto.status || 'PRESENT',
        attendanceType: dto.attendanceType || 'DAILY',
        classGroupId: dto.classGroupId || null,
        lateMinutes: dto.lateMinutes || 0,
        reason: dto.reason || null,
        isExcused: dto.isExcused || false,
        notes: dto.notes || null,
        recordedBy: dto.recordedBy || null,
      }),
    );
    return this.attendanceRepo.save(entities);
  }

  async findByDate(date: Date): Promise<Attendance[]> {
    return this.attendanceRepo.find({
      where: { date },
      relations: ['student', 'classGroup'],
      order: { student: { lastName: 'ASC' } },
    });
  }

  async findByStudent(studentId: number): Promise<Attendance[]> {
    return this.attendanceRepo.find({
      where: { studentId },
      relations: ['classGroup'],
      order: { date: 'DESC' },
    });
  }

  async findByClassGroup(classGroupId: number, date: Date): Promise<Attendance[]> {
    return this.attendanceRepo.find({
      where: { classGroupId, date },
      relations: ['student'],
      order: { student: { lastName: 'ASC' } },
    });
  }

  async findByRange(
    startDate: Date,
    endDate: Date,
    studentId?: number,
    classGroupId?: number,
  ): Promise<Attendance[]> {
    const query = this.attendanceRepo.createQueryBuilder('attendance')
      .where('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (studentId) {
      query.andWhere('attendance.studentId = :studentId', { studentId });
    }
    if (classGroupId) {
      query.andWhere('attendance.classGroupId = :classGroupId', { classGroupId });
    }

    return query
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.classGroup', 'classGroup')
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('student.lastName', 'ASC')
      .getMany();
  }

  async update(id: number, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!attendance) {
      throw new Error('Attendance record not found');
    }
    if (dto.status !== undefined) attendance.status = dto.status;
    if (dto.checkInTime !== undefined) attendance.checkInTime = dto.checkInTime;
    if (dto.checkOutTime !== undefined) attendance.checkOutTime = dto.checkOutTime;
    if (dto.lateMinutes !== undefined) attendance.lateMinutes = dto.lateMinutes;
    if (dto.reason !== undefined) attendance.reason = dto.reason;
    if (dto.isExcused !== undefined) attendance.isExcused = dto.isExcused;
    if (dto.excuseDocument !== undefined) attendance.excuseDocument = dto.excuseDocument;
    if (dto.notes !== undefined) attendance.notes = dto.notes;
    return this.attendanceRepo.save(attendance);
  }

  async remove(id: number): Promise<{ success: true }> {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });
    if (!attendance) {
      throw new Error('Attendance record not found');
    }
    await this.attendanceRepo.remove(attendance);
    return { success: true };
  }

  async getStatistics(studentId?: number, classGroupId?: number, startDate?: Date, endDate?: Date) {
    const query = this.attendanceRepo.createQueryBuilder('attendance');
    
    if (studentId) {
      query.andWhere('attendance.studentId = :studentId', { studentId });
    }
    if (classGroupId) {
      query.andWhere('attendance.classGroupId = :classGroupId', { classGroupId });
    }
    if (startDate && endDate) {
      query.andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

      const results = await query
        .select(['status', 'isExcused', 'COUNT(*) as count'])
        .groupBy('status, isExcused')
        .getRawMany();

    return results;
  }

  async getStudentAttendanceRate(studentId: number, academicYearId?: number): Promise<number> {
    const query = this.attendanceRepo.createQueryBuilder('attendance')
      .where('attendance.studentId = :studentId', { studentId });

    if (academicYearId) {
      // Would need to join with enrollments to filter by academic year
      // For now, calculate overall
    }

    const total = await query.getCount();
    const present = await query.andWhere('attendance.status IN (:...statuses)', {
      statuses: ['PRESENT', 'LATE']
    }).getCount();

    return total > 0 ? (present / total) * 100 : 0;
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../db/entities/student.entity.js';
import { StudentParent } from '../db/entities/student-parent.entity.js';
import { User } from '../db/entities/user.entity.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { AssignParentDto } from './dto/assign-parent.dto.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepo: Repository<Student>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentsRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      dob: dto.dob ? new Date(dto.dob) : null,
      gender: dto.gender || null,
      photoUrl: dto.photoUrl || null,
      email: dto.email || null,
      phone: dto.phone || null,
      address: dto.address || null,
      city: dto.city || null,
      postalCode: dto.postalCode || null,
      country: dto.country || null,
      nationality: dto.nationality || null,
      emergencyContactName: dto.emergencyContactName || null,
      emergencyContactPhone: dto.emergencyContactPhone || null,
      medicalInfo: dto.medicalInfo || null,
      studentIdNumber: dto.studentIdNumber || null,
      className: dto.className ?? null,
      status: dto.status || 'ACTIVE',
    });
    return this.studentsRepo.save(student);
  }

  async list(): Promise<Student[]> {
    return this.studentsRepo.find({
      order: { id: 'DESC' },
      relations: ['studentParents', 'studentParents.parent', 'reportCards'],
    });
  }

  async getById(id: number): Promise<Student> {
    const student = await this.studentsRepo.findOne({
      where: { id },
      relations: [
        'studentParents',
        'studentParents.parent',
        'grades',
        'payments',
        'progress',
        'messages',
        'enrollments',
        'enrollments.academicYear',
        'enrollments.classGroup',
        'examScores',
        'examScores.exam',
        'reportCards',
      ],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.getById(id);
    if (dto.firstName !== undefined) student.firstName = dto.firstName;
    if (dto.lastName !== undefined) student.lastName = dto.lastName;
    if (dto.dob !== undefined) student.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.gender !== undefined) student.gender = dto.gender;
    if (dto.photoUrl !== undefined) student.photoUrl = dto.photoUrl;
    if (dto.email !== undefined) student.email = dto.email;
    if (dto.phone !== undefined) student.phone = dto.phone;
    if (dto.address !== undefined) student.address = dto.address;
    if (dto.city !== undefined) student.city = dto.city;
    if (dto.postalCode !== undefined) student.postalCode = dto.postalCode;
    if (dto.country !== undefined) student.country = dto.country;
    if (dto.nationality !== undefined) student.nationality = dto.nationality;
    if (dto.emergencyContactName !== undefined)
      student.emergencyContactName = dto.emergencyContactName;
    if (dto.emergencyContactPhone !== undefined)
      student.emergencyContactPhone = dto.emergencyContactPhone;
    if (dto.medicalInfo !== undefined) student.medicalInfo = dto.medicalInfo;
    if (dto.studentIdNumber !== undefined)
      student.studentIdNumber = dto.studentIdNumber;
    if (dto.className !== undefined) student.className = dto.className;
    if (dto.status !== undefined) student.status = dto.status;
    return this.studentsRepo.save(student);
  }

  async remove(id: number): Promise<{ success: true }> {
    const student = await this.getById(id);
    await this.studentsRepo.remove(student);
    return { success: true };
  }

  async assignStudentsToParent(parentId: number, studentIds: number[]): Promise<void> {
    for (const studentId of studentIds) {
      const [student, parentUser] = await Promise.all([
        this.studentsRepo.findOne({ where: { id: studentId } }),
        this.usersRepo.findOne({ where: { id: parentId } }),
      ]);

      if (!student) throw new NotFoundException(`Student #${studentId} not found`);
      if (!parentUser) throw new NotFoundException('Parent user not found');

      const validParentRoles = ['PARENT', 'MERE', 'mere', 'parent'];
      if (!validParentRoles.includes(parentUser.role)) {
        throw new ForbiddenException('User is not a parent (must have PARENT, MERE role)');
      }

      const existing = await this.studentParentsRepo.findOne({
        where: { studentId, parentId },
      });
      if (existing) continue;

      const existingParent = await this.studentParentsRepo.findOne({
        where: { studentId },
      });
      if (existingParent) {
        throw new ForbiddenException(`Student #${studentId} already has a parent assigned`);
      }

      const link = this.studentParentsRepo.create({ studentId, parentId });
      await this.studentParentsRepo.save(link);
    }
  }

  async getStudentsByParent(parentId: number): Promise<Student[]> {
    const links = await this.studentParentsRepo.find({
      where: { parentId },
      relations: ['student', 'student.grades'],
      order: { student: { id: 'DESC' } as any },
    });
    return links.map((l) => l.student);
  }

  async assignParents(studentId: number, dto: AssignParentDto): Promise<void> {
    const [student, parentUser] = await Promise.all([
      this.studentsRepo.findOne({ where: { id: studentId } }),
      this.usersRepo.findOne({ where: { id: dto.parentId } }),
    ]);

    if (!student) throw new NotFoundException('Student not found');
    if (!parentUser) throw new NotFoundException('Parent user not found');

    const validParentRoles = ['PARENT', 'MERE', 'mere', 'parent'];
    if (!validParentRoles.includes(parentUser.role)) {
      throw new ForbiddenException('User is not a parent (must have PARENT, MERE role)');
    }

    const existing = await this.studentParentsRepo.findOne({
      where: { studentId, parentId: dto.parentId },
    });
    if (existing) return;

    const existingParent = await this.studentParentsRepo.findOne({
      where: { studentId },
    });
    if (existingParent) {
      throw new ForbiddenException('This student already has a parent assigned');
    }

    const link = this.studentParentsRepo.create({
      studentId,
      parentId: dto.parentId,
    });
    await this.studentParentsRepo.save(link);
  }

  async myStudents(parentId: number): Promise<Student[]> {
    const links = await this.studentParentsRepo.find({
      where: { parentId },
      relations: [
        'student',
        'student.grades',
        'student.examScores',
        'student.examScores.exam',
        'student.reportCards',
        'student.enrollments',
        'student.enrollments.academicYear',
        'student.enrollments.classGroup',
      ],
      order: { student: { id: 'DESC' } as any },
    });
    return links.map((l) => l.student);
  }

  async ensureParentOfStudent(
    parentId: number,
    studentId: number,
  ): Promise<void> {
    const link = await this.studentParentsRepo.findOne({
      where: { parentId, studentId },
    });
    if (!link) throw new ForbiddenException('Not allowed');
  }

  async assignClass(
    studentId: number,
    className: string | null,
  ): Promise<Student> {
    const student = await this.getById(studentId);
    student.className = className;
    return this.studentsRepo.save(student);
  }
}

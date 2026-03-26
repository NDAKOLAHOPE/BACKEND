import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
    @InjectRepository(Student) private readonly studentsRepo: Repository<Student>,
    @InjectRepository(StudentParent)
    private readonly studentParentsRepo: Repository<StudentParent>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentsRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      dob: dto.dob ? new Date(dto.dob) : null,
      className: dto.className ?? null,
    });
    return this.studentsRepo.save(student);
  }

  async list(): Promise<Student[]> {
    return this.studentsRepo.find({ order: { id: 'DESC' } });
  }

  async getById(id: number): Promise<Student> {
    const student = await this.studentsRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.getById(id);
    if (dto.firstName !== undefined) student.firstName = dto.firstName;
    if (dto.lastName !== undefined) student.lastName = dto.lastName;
    if (dto.dob !== undefined) student.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.className !== undefined) student.className = dto.className ?? null;
    return this.studentsRepo.save(student);
  }

  async assignParents(studentId: number, dto: AssignParentDto): Promise<void> {
    const [student, parentUser] = await Promise.all([
      this.studentsRepo.findOne({ where: { id: studentId } }),
      this.usersRepo.findOne({ where: { id: dto.parentId } }),
    ]);

    if (!student) throw new NotFoundException('Student not found');
    if (!parentUser) throw new NotFoundException('Parent user not found');

    // Optionnel: on peut forcer role=PARENT
    // if (parentUser.role !== 'PARENT') throw new ForbiddenException('User is not a parent');

    const existing = await this.studentParentsRepo.findOne({
      where: { studentId, parentId: dto.parentId },
    });
    if (existing) return;

    const link = this.studentParentsRepo.create({
      studentId,
      parentId: dto.parentId,
    });
    await this.studentParentsRepo.save(link);
  }

  async myStudents(parentId: number): Promise<Student[]> {
    const links = await this.studentParentsRepo.find({
      where: { parentId },
      relations: ['student'],
      order: { student: { id: 'DESC' } as any },
    });
    return links.map((l) => l.student);
  }

  async ensureParentOfStudent(parentId: number, studentId: number): Promise<void> {
    const link = await this.studentParentsRepo.findOne({
      where: { parentId, studentId },
    });
    if (!link) throw new ForbiddenException('Not allowed');
  }

  async assignClass(studentId: number, className: string | null): Promise<Student> {
    const student = await this.getById(studentId);
    student.className = className;
    return this.studentsRepo.save(student);
  }
}


import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity.js';
import { AcademicYear } from './academic-year.entity.js';
import { ClassGroup } from './class-group.entity.js';

export type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type EnrollmentType = 'NEW' | 'RETURNING' | 'TRANSFER' | 'EXCHANGE';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.enrollments)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'academic_year_id', type: 'int' })
  academicYearId!: number;

  @ManyToOne(() => AcademicYear, (ay) => ay.enrollments)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear!: AcademicYear;

  @Column({ name: 'class_group_id', type: 'int', nullable: true })
  classGroupId!: number | null;

  @ManyToOne(() => ClassGroup, { nullable: true })
  @JoinColumn({ name: 'class_group_id' })
  classGroup!: ClassGroup | null;

  @Column({
    name: 'enrollment_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  enrollmentDate!: Date;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'CONFIRMED',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
  })
  status!: EnrollmentStatus;

  @Column({
    name: 'enrollment_type',
    type: 'varchar',
    length: 20,
    default: 'NEW',
    enum: ['NEW', 'RETURNING', 'TRANSFER', 'EXCHANGE'],
  })
  enrollmentType!: EnrollmentType;

  @Column({ name: 'tuition_fee', type: 'numeric', precision: 10, scale: 2, nullable: true })
  tuitionFee!: number | null;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: 'UNPAID' })
  paymentStatus!: 'UNPAID' | 'PARTIAL' | 'PAID' | 'EXEMPT';

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

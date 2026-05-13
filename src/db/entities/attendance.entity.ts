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
import { ClassGroup } from './class-group.entity.js';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNEXCUSED';
export type AttendanceType = 'DAILY' | 'SESSION' | 'EVENT';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.attendances)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'date', type: 'date' })
  date!: Date;

  @Column({ name: 'day_of_week', type: 'varchar', length: 10, nullable: true })
  dayOfWeek!: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'PRESENT',
    enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'UNEXCUSED'],
  })
  status!: AttendanceStatus;

  @Column({
    name: 'attendance_type',
    type: 'varchar',
    length: 20,
    default: 'DAILY',
    enum: ['DAILY', 'SESSION', 'EVENT'],
  })
  attendanceType!: AttendanceType;

  @Column({ name: 'class_group_id', type: 'int', nullable: true })
  classGroupId!: number | null;

  @ManyToOne(() => ClassGroup, (cg) => cg.enrollments, { nullable: true })
  @JoinColumn({ name: 'class_group_id' })
  classGroup!: ClassGroup | null;

  @Column({ name: 'check_in_time', type: 'datetime', nullable: true })
  checkInTime!: Date | null;

  @Column({ name: 'check_out_time', type: 'datetime', nullable: true })
  checkOutTime!: Date | null;

  @Column({ name: 'late_minutes', type: 'int', nullable: true, default: 0 })
  lateMinutes!: number | null;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason!: string | null;

  @Column({ name: 'is_excused', type: 'boolean', default: false })
  isExcused!: boolean;

  @Column({ name: 'excuse_document', type: 'varchar', length: 500, nullable: true })
  excuseDocument!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'recorded_by', type: 'int', nullable: true })
  recordedBy!: number | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

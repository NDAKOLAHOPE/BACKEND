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
import { Enrollment } from './enrollment.entity.js';
import { Attendance } from './attendance.entity.js';
import { ExamScore } from './exam-score.entity.js';

export type ReportCardStatus = 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED';
export type DecisionType = 'PROMOTED' | 'RETAINED' | 'GRADUATED' | 'EXPELLED' | 'WITHDRAWN' | 'UNDECIDED';

@Entity('report_cards')
export class ReportCard {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.reportCards)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'academic_year_id', type: 'int' })
  academicYearId!: number;

  @Column({ name: 'class_group_id', type: 'int', nullable: true })
  classGroupId!: number | null;

  @Column({ name: 'term', type: 'varchar', length: 50 })
  term!: string;

  @Column({ name: 'total_score', type: 'numeric', precision: 6, scale: 2 })
  totalScore!: number;

  @Column({ name: 'average', type: 'numeric', precision: 6, scale: 2 })
  average!: number;

  @Column({ name: 'max_possible', type: 'numeric', precision: 6, scale: 2 })
  maxPossible!: number;

  @Column({ name: 'percentage', type: 'numeric', precision: 5, scale: 2 })
  percentage!: number;

  @Column({ name: 'class_rank', type: 'int', nullable: true })
  classRank!: number | null;

  @Column({ name: 'class_size', type: 'int', nullable: true })
  classSize!: number | null;

  @Column({ name: 'attendance_days_present', type: 'int', default: 0 })
  attendanceDaysPresent!: number;

  @Column({ name: 'attendance_days_absent', type: 'int', default: 0 })
  attendanceDaysAbsent!: number;

  @Column({ name: 'attendance_percentage', type: 'numeric', precision: 5, scale: 2, default: 0 })
  attendancePercentage!: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'DRAFT',
    enum: ['DRAFT', 'GENERATED', 'PUBLISHED', 'ARCHIVED'],
  })
  status!: ReportCardStatus;

  @Column({
    name: 'decision',
    type: 'varchar',
    length: 30,
    nullable: true,
    enum: ['PROMOTED', 'RETAINED', 'GRADUATED', 'EXPELLED', 'WITHDRAWN', 'UNDECIDED'],
  })
  decision!: DecisionType | null;

  @Column({ name: 'principal_comments', type: 'text', nullable: true })
  principalComments!: string | null;

  @Column({ name: 'teacher_comments', type: 'text', nullable: true })
  teacherComments!: string | null;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks!: string | null;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'generated_by', type: 'int', nullable: true })
  generatedBy!: number | null;

  @Column({ name: 'pdf_url', type: 'varchar', length: 500, nullable: true })
  pdfUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // Virtual fields for UI (computed)
  get gradePointAverage(): number {
    return this.average;
  }

  get attendanceRate(): number {
    return this.attendancePercentage;
  }

  get isPassing(): boolean {
    return this.average >= 10;
  }
}

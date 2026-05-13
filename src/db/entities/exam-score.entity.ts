import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity.js';
import { Student } from './student.entity.js';

export type ScoreStatus = 'NOT_GRADED' | 'GRADED' | 'REVIEWED' | 'ABSENT' | 'EXEMPT';

@Entity('exam_scores')
export class ExamScore {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'exam_id', type: 'int' })
  examId!: number;

  @ManyToOne(() => Exam, (e) => e.examScores)
  @JoinColumn({ name: 'exam_id' })
  exam!: Exam;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.examScores)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({
    name: 'score',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  score!: number | null;

  @Column({ name: 'max_possible', type: 'numeric', precision: 6, scale: 2, nullable: true })
  maxPossible!: number | null;

  @Column({ name: 'percentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  percentage!: number | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'NOT_GRADED',
    enum: ['NOT_GRADED', 'GRADED', 'REVIEWED', 'ABSENT', 'EXEMPT'],
  })
  status!: ScoreStatus;

  @Column({ name: 'grade_letter', type: 'varchar', length: 5, nullable: true })
  gradeLetter!: string | null;

  @Column({ name: 'comments', type: 'text', nullable: true })
  comments!: string | null;

  @Column({ name: 'graded_by', type: 'int', nullable: true })
  gradedBy!: number | null;

  @Column({ name: 'graded_at', type: 'datetime', nullable: true })
  gradedAt!: Date | null;

  @Column({ name: 'is_absent', type: 'boolean', default: false })
  isAbsent!: boolean;

  @Column({ name: 'excuse_reason', type: 'text', nullable: true })
  excuseReason!: string | null;

  @Column({ name: 'is_excused', type: 'boolean', default: false })
  isExcused!: boolean;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

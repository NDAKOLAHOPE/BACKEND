import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassGroup } from './class-group.entity.js';
import { AcademicYear } from './academic-year.entity.js';
import { ExamScore } from './exam-score.entity.js';

export type ExamType = 'WRITTEN' | 'ORAL' | 'PRACTICAL' | 'PROJECT' | 'QUIZ' | 'MIDTERM' | 'FINAL';
export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'GRADING' | 'PUBLISHED';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'subject', type: 'varchar', length: 100 })
  subject!: string;

  @Column({
    name: 'exam_type',
    type: 'varchar',
    length: 30,
    enum: ['WRITTEN', 'ORAL', 'PRACTICAL', 'PROJECT', 'QUIZ', 'MIDTERM', 'FINAL'],
  })
  examType!: ExamType;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'DRAFT',
    enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'GRADING', 'PUBLISHED'],
  })
  status!: ExamStatus;

  @Column({ name: 'class_group_id', type: 'int' })
  classGroupId!: number;

  @ManyToOne(() => ClassGroup, { eager: true })
  @JoinColumn({ name: 'class_group_id' })
  classGroup!: ClassGroup;

  @Column({ name: 'academic_year_id', type: 'int', nullable: true })
  academicYearId!: number | null;

  @ManyToOne(() => AcademicYear, { nullable: true })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear!: AcademicYear | null;

  @Column({ name: 'exam_date', type: 'date' })
  examDate!: Date;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime!: Date | null;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime!: Date | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes!: number | null;

  @Column({ name: 'max_score', type: 'numeric', precision: 6, scale: 2, default: 20 })
  maxScore!: number;

  @Column({ name: 'passing_score', type: 'numeric', precision: 6, scale: 2, nullable: true })
  passingScore!: number | null;

  @Column({ name: 'weight', type: 'numeric', precision: 5, scale: 2, default: 1.00 })
  weight!: number;

  @Column({ name: 'coeff', type: 'numeric', precision: 5, scale: 2, default: 1.00 })
  coefficient!: number;

  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions!: string | null;

  @Column({ name: 'materials_allowed', type: 'text', nullable: true })
  materialsAllowed!: string | null;

  @Column({ name: 'location', type: 'varchar', length: 200, nullable: true })
  location!: string | null;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy!: number | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => ExamScore, (es) => es.exam)
  examScores!: ExamScore[];
}

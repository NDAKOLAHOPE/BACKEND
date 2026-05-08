import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { numericToNumberTransformer } from '../transformers/numeric.transformer.js';
import { Student } from './student.entity.js';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.grades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'subject', type: 'varchar', length: 100 })
  subject!: string;

  @Column({
    name: 'score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericToNumberTransformer,
  })
  score!: number;

  @Column({ name: 'term', type: 'varchar', length: 50, nullable: true })
  term!: string | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}

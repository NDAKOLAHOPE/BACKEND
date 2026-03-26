import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Student } from './student.entity.js';
import { User } from './user.entity.js';

@Entity('student_parents')
export class StudentParent {
  @PrimaryColumn({ name: 'student_id', type: 'int' })
  studentId!: number;

  @PrimaryColumn({ name: 'parent_id', type: 'int' })
  parentId!: number;

  @ManyToOne(() => Student, (s) => s.studentParents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToOne(() => User, (u) => u.studentParentsAsParent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: User;
}


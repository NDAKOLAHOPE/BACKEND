import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student.entity.js';
import { User } from './user.entity.js';

@Entity('parent_messages')
export class ParentMessage {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'parent_id', type: 'int' })
  parentId!: number;

  @ManyToOne(() => User, (u) => u.studentParentsAsParent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent!: User;

  @Column({ name: 'message', type: 'text' })
  message!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'now()' })
  createdAt!: Date;
}


import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentParent } from './student-parent.entity.js';
import { Grade } from './grade.entity.js';
import { Payment, PaymentType } from './payment.entity.js';
import { Progress } from './progress.entity.js';
import { ParentMessage } from './parent-message.entity.js';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob!: Date | null;

  @Column({ name: 'class', type: 'varchar', length: 50, nullable: true })
  className!: string | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => StudentParent, (sp) => sp.student)
  studentParents!: StudentParent[];

  @OneToMany(() => Grade, (g) => g.student)
  grades!: Grade[];

  @OneToMany(() => Payment, (p) => p.student)
  payments!: PaymentType[];

  @OneToMany(() => Progress, (pr) => pr.student)
  progress!: Progress[];

  @OneToMany(() => ParentMessage, (m) => m.student)
  messages!: ParentMessage[];
}


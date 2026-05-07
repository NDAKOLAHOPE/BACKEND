import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentParent } from './student-parent.entity.js';
import type { Role } from '../../common/constants/roles.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'email', type: 'varchar', unique: true })
  email!: string;

  @Column({ name: 'password', type: 'varchar' })
  password!: string;

  @Column({ name: 'role', type: 'varchar' })
  role!: Role; // ADMIN | TEACHER | PARENT | STUDENT

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => StudentParent, (sp) => sp.parent)
  studentParentsAsParent!: StudentParent[];
}


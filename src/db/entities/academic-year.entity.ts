import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassGroup } from './class-group.entity.js';
import { Enrollment } from './enrollment.entity.js';

export type AcademicYearStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
    enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
  })
  status!: AcademicYearStatus;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => ClassGroup, (c) => c.academicYear)
  classGroups!: ClassGroup[];

  @OneToMany(() => Enrollment, (e) => e.academicYear)
  enrollments!: Enrollment[];
}

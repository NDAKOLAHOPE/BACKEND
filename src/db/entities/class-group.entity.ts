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
import { AcademicYear } from './academic-year.entity.js';
import { Enrollment } from './enrollment.entity.js';
import { Student } from './student.entity.js';

export type SectionType = 'GENERAL' | 'SCIENTIFIC' | 'LITERARY' | 'TECHNICAL' | 'VOCATIONAL' | 'OTHER';
export type ClassLevel = 'Maternelle' | 'Primaire' | 'College' | 'Lycee' | 'Universite';

@Entity('class_groups')
export class ClassGroup {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'level', type: 'varchar', length: 50, enum: ['Maternelle', 'Primaire', 'College', 'Lycee', 'Universite'] })
  level!: ClassLevel;

  @Column({ name: 'section', type: 'varchar', length: 50, nullable: true, enum: ['GENERAL', 'SCIENTIFIC', 'LITERARY', 'TECHNICAL', 'VOCATIONAL', 'OTHER'] })
  section!: SectionType | null;

  @Column({ name: 'academic_year_id', type: 'int' })
  academicYearId!: number;

  @ManyToOne(() => AcademicYear, (ay) => ay.classGroups)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear!: AcademicYear;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'class_teacher_id' })
  classTeacher!: Student | null;

  @OneToMany(() => Enrollment, (e) => e.classGroup)
  enrollments!: Enrollment[];

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

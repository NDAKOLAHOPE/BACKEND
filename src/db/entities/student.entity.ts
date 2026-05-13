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
import { Enrollment } from './enrollment.entity.js';
import { Attendance } from './attendance.entity.js';
import { ExamScore } from './exam-score.entity.js';
import { ReportCard } from './report-card.entity.js';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'TRANSFERRED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

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

  @Column({ name: 'gender', type: 'varchar', length: 20, nullable: true, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] })
  gender!: Gender | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: true, unique: true })
  email!: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode!: string | null;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country!: string | null;

  @Column({ name: 'nationality', type: 'varchar', length: 100, nullable: true })
  nationality!: string | null;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100, nullable: true })
  emergencyContactName!: string | null;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ name: 'medical_info', type: 'text', nullable: true })
  medicalInfo!: string | null;

  @Column({ name: 'student_id_number', type: 'varchar', length: 50, nullable: true, unique: true })
  studentIdNumber!: string | null;

  @Column({ name: 'class', type: 'varchar', length: 50, nullable: true })
  className!: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'],
  })
  status!: StudentStatus;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => StudentParent, (sp) => sp.student)
  studentParents!: StudentParent[];

  @OneToMany(() => Grade, (g) => g.student)
  grades!: Grade[];

  @OneToMany(() => Payment, (p) => p.student)
  payments!: Payment[];

  @OneToMany(() => Progress, (pr) => pr.student)
  progress!: Progress[];

  @OneToMany(() => ParentMessage, (m) => m.student)
  messages!: ParentMessage[];

  @OneToMany(() => Enrollment, (e) => e.student)
  enrollments!: Enrollment[];

  @OneToMany(() => Attendance, (a) => a.student)
  attendances!: Attendance[];

  @OneToMany(() => ExamScore, (es) => es.student)
  examScores!: ExamScore[];

  @OneToMany(() => ReportCard, (rc) => rc.student)
  reportCards!: ReportCard[];
}

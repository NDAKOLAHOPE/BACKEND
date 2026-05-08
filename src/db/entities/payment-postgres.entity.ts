import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericToNumberTransformer } from '../transformers/numeric.transformer.js';
import { Student } from './student.entity.js';

@Entity('payments')
export class PaymentPostgres {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId!: number;

  @ManyToOne(() => Student, (s) => s.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({
    name: 'amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericToNumberTransformer,
  })
  amount!: number;

  @Column({
    name: 'payment_date',
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  paymentDate!: Date;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'PENDING' })
  status!: 'PENDING' | 'PAID' | string;
}

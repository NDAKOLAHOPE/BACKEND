import { DataSource } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Student } from './entities/student.entity.js';
import { StudentParent } from './entities/student-parent.entity.js';
import { Grade } from './entities/grade.entity.js';
import { Payment } from './entities/payment.entity.js';
import { Progress } from './entities/progress.entity.js';
import { ParentMessage } from './entities/parent-message.entity.js';
import { AcademicYear } from './entities/academic-year.entity.js';
import { ClassGroup } from './entities/class-group.entity.js';
import { Enrollment } from './entities/enrollment.entity.js';
import { Attendance } from './entities/attendance.entity.js';
import { Exam } from './entities/exam.entity.js';
import { ExamScore } from './entities/exam-score.entity.js';
import { ReportCard } from './entities/report-card.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Student,
    StudentParent,
    Grade,
    Payment,
    Progress,
    ParentMessage,
    AcademicYear,
    ClassGroup,
    Enrollment,
    Attendance,
    Exam,
    ExamScore,
    ReportCard,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

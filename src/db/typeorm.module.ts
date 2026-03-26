import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity.js';
import { Student } from './entities/student.entity.js';
import { StudentParent } from './entities/student-parent.entity.js';
import { Grade } from './entities/grade.entity.js';
import { Payment } from './entities/payment.entity.js';
import { Progress } from './entities/progress.entity.js';
import { ParentMessage } from './entities/parent-message.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const url = process.env.DATABASE_URL;
        if (!url) {
          throw new Error(
            'Missing DATABASE_URL. Exemple: postgresql://USER:PASSWORD@localhost:5432/school_db',
          );
        }

        return {
          type: 'postgres',
          url,
          autoLoadEntities: false,
          synchronize: false,
          logging: process.env.NODE_ENV === 'development',
          // Dev-only: certaines chaînes TLS (proxy/pgbouncer) peuvent être interprétées comme "self-signed"
          // dans certains environnements. En prod, on laisse la validation par défaut.
          ssl:
            process.env.NODE_ENV === 'development'
              ? { rejectUnauthorized: false }
              : undefined,
          extra:
            process.env.NODE_ENV === 'development'
              ? { ssl: { rejectUnauthorized: false } }
              : undefined,
          entities: [User, Student, StudentParent, Grade, Payment, Progress, ParentMessage],
        };
      },
    }),
  ],
})
export class TypeormDatabaseModule {}


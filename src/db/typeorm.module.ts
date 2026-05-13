import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { setServers, promises as dns } from 'node:dns';
import { connect as netConnect } from 'node:net';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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

async function verifyReachable(address: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = netConnect({ host: address, port, timeout: 3000 }, () => {
      socket.destroy();
      resolve();
    });

    socket.on('error', reject);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TCP timeout'));
    });
  });
}

async function resolveDatabaseHost(
  host: string,
  port: number,
): Promise<string> {
  setServers(['1.1.1.1', '8.8.8.8']);
  let hasIpv4Address = false;

  try {
    const addresses = await dns.resolve4(host);
    if (addresses.length > 0) {
      hasIpv4Address = true;
      for (const address of addresses) {
        try {
          await verifyReachable(address, port);
          return address;
        } catch {
          continue;
        }
      }
    }
  } catch {
    // ignore; fallback to AAAA
  }

  try {
    const addresses = await dns.resolve6(host);
    if (addresses.length > 0) {
      for (const address of addresses) {
        try {
          await verifyReachable(address, port);
          return address;
        } catch {
          continue;
        }
      }
    }
  } catch {
    // ignore; fallback to error
  }

  if (!hasIpv4Address) {
    throw new Error(
      `Aucun enregistrement IPv4 (A) n'a été trouvé pour ${host}. ` +
        'Le domaine ne semble proposer qu’une adresse IPv6 et ton environnement ne peut pas l’atteindre. ' +
        'Il n’est pas possible de se connecter en IPv4 à ce host Supabase.',
    );
  }

  throw new Error(
    `Unable to reach database host ${host} on port ${port}. ` +
      'Ton environnement réseau ne supporte probablement pas IPv6 ou le port 5432 est bloqué. ' +
      'Vérifie ta connexion, ton firewall et le fait que ton PC puisse accéder aux adresses IPv6 de Supabase.',
  );
}

function sqliteFallbackPath(): string {
  const dataPath = join(process.cwd(), 'data');
  if (!existsSync(dataPath)) {
    mkdirSync(dataPath, { recursive: true });
  }
  return join(dataPath, 'school.sqlite');
}

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

        const parsedUrl = new URL(url);
        const host = parsedUrl.hostname;
        const port = parseInt(parsedUrl.port || '5432', 10);
        const username = decodeURIComponent(parsedUrl.username);
        const password = decodeURIComponent(parsedUrl.password);
        const database = parsedUrl.pathname?.slice(1) || undefined;
        const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(host);

        const baseOptions = {
          type: 'postgres' as const,
          autoLoadEntities: false,
          synchronize: false,
          logging: process.env.NODE_ENV === 'development',
          ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
          extra: isLocalHost
            ? undefined
            : { ssl: { rejectUnauthorized: false } },
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
        };

        if (isLocalHost) {
          return {
            ...baseOptions,
            host,
            port,
            username,
            password,
            database,
          };
        }

        try {
          const resolvedHost = await resolveDatabaseHost(host, port);
          return {
            ...baseOptions,
            host: resolvedHost,
            port,
            username,
            password,
            database,
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              'Postgres Supabase non accessible, utilisation d’un fallback SQLite local en développement.',
            );
            return {
              type: 'sqlite' as const,
              database: sqliteFallbackPath(),
              synchronize: true,
              logging: true,
              autoLoadEntities: false,
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
            };
          }
          throw error;
        }
      },
    }),
  ],
})
export class TypeormDatabaseModule {}

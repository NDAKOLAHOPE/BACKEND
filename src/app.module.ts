import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './common/guards/roles.guard.js';
import { TypeormDatabaseModule } from './db/typeorm.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { StudentsModule } from './students/students.module.js';
import { GradesModule } from './grades/grades.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ProgressModule } from './progress/progress.module.js';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Charge "school-api/.env" si présent; sinon c'est ok (vars déjà en environnement)
      envFilePath: '.env',
    }),
    TypeormDatabaseModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    GradesModule,
    PaymentsModule,
    MessagesModule,
    DashboardModule,
    NotificationsModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}

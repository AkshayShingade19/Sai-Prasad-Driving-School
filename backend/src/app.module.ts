import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { InstructorsModule } from './modules/instructors/instructors.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DemoBookingsModule } from './modules/demo-bookings/demo-bookings.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { DatabaseSeedModule } from './modules/seed/seed.module';
import { StudentPortalModule } from './modules/student-portal/student-portal.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://127.0.0.1:27017/sai_prasad_driving_school'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
      {
        name: 'strict',
        ttl: 60_000,
        limit: 5,
      },
    ]),
    AuthModule,
    UsersModule,
    StudentsModule,
    CoursesModule,
    InstructorsModule,
    LessonsModule,
    AttendanceModule,
    DemoBookingsModule,
    ServiceRequestsModule,
    PaymentsModule,
    SettingsModule,
    AuditLogsModule,
    DatabaseSeedModule,
    StudentPortalModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

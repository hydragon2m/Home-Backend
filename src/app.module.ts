import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AuthModule } from './modules/auth/auth.module';
import { CaslModule } from './modules/casl/casl.module';
import { EventsModule } from './modules/events/events.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './modules/health/health.controller';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Tự động tạo bảng dựa trên code TypeORM (chỉ dùng cho Dev)
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    OrganizationsModule,
    AuthModule,
    CaslModule,
    EventsModule,
    TerminusModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute per IP
    }]),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });
  
  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || true,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ property không có trong DTO
    forbidNonWhitelisted: true, // Cấm gửi property vớ vẩn / sai cấu trúc
    transform: true, // Tự động cast kiểu dữ liệu
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

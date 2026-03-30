import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  
  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.enableCors({
    origin: allowedOrigins ? allowedOrigins.split(',') : true,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ property không có trong DTO
    forbidNonWhitelisted: true, // Cấm gửi property vớ vẩn / sai cấu trúc
    transform: true, // Tự động cast kiểu dữ liệu
  }));

  // Anti-cache & Security Headers for Edge/CDN (Vercel/Cloudflare)
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Vary', 'Cookie');
    next();
  });

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port);
}
bootstrap();

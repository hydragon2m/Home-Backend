import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ property không có trong DTO
    forbidNonWhitelisted: true, // Cấm gửi property vớ vẩn / sai cấu trúc
    transform: true, // Tự động cast kiểu dữ liệu
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

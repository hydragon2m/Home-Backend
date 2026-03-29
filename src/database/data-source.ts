import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'admin',
  password: process.env.DATABASE_PASSWORD || 'admin123',
  database: process.env.DATABASE_NAME || 'nest_db',
  synchronize: false, // Tắt đồng bộ tự động để dùng Migration
  logging: true,
  entities: [User],
  migrations: ['src/database/migrations/*.ts'], // Nơi chứa các file migration sinh ra
  subscribers: [],
});

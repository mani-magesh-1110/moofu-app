import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { ParkingSpace } from '../entities/ParkingSpace';
import { Booking } from '../entities/Booking';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moofu_parking',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, ParkingSpace, Booking],
  migrations: [],
  subscribers: [],
});


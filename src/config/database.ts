import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import * as models from '../models';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Sequelize instance
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crm',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  models: Object.values(models),
  dialectOptions: {
    ssl: process.env.SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Function to test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
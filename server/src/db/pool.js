import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

// Connection settings. Tests use the separate test database.
export const dbConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.NODE_ENV === 'test' ? env.TEST_DB_NAME : env.DB_NAME,
  charset: 'utf8mb4',
  // Send DECIMAL as numbers and DATE as 'YYYY-MM-DD' text (default: strings and JS Dates).
  decimalNumbers: true,
  dateStrings: ['DATE'],
};

// One shared pool for the whole app.
export const pool = mysql.createPool({ ...dbConfig, connectionLimit: 10 });

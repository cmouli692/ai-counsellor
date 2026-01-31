import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ai_counsellor',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Execute query
export const query = (text, params) => {
  return pool.query(text, params);
};

// Get single row
export const getOne = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
};

// Get all rows
export const getAll = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};

// Insert/Create
export const insert = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

// Close pool
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

// Default export for compatibility
const db = { query, getOne, getAll, insert, pool };
export default db;

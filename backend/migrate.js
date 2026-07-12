import pool from './config/db.js';

/**
 * Runs database migrations to create the users table and related indexes.
 * Uses IF NOT EXISTS so it's safe to call multiple times (idempotent).
 */
export async function migrate() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL CHECK (char_length(full_name) <= 100),
      company_name TEXT NOT NULL CHECK (char_length(company_name) <= 150),
      email TEXT NOT NULL CHECK (char_length(email) <= 255),
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createIndexSQL = `
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (LOWER(email));
  `;

  try {
    await pool.query(createTableSQL);
    await pool.query(createIndexSQL);
    console.log('Migration completed: users table and indexes are ready.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  }
}

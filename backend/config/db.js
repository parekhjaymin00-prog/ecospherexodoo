import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pg;

// In-memory store as fallback when PostgreSQL is not available
const memoryStore = {
  users: [],
};

// Fake pool that mimics pg Pool.query() interface using in-memory array
const memoryPool = {
  async query(text, params = []) {
    // Handle SELECT NOW() - connection test
    if (text.trim().toUpperCase().startsWith('SELECT NOW()')) {
      return { rows: [{ now: new Date().toISOString() }] };
    }

    // Handle CREATE TABLE / CREATE INDEX (migration) - no-op for memory
    if (text.trim().toUpperCase().startsWith('CREATE TABLE') || text.trim().toUpperCase().startsWith('CREATE UNIQUE INDEX')) {
      return { rows: [] };
    }

    // Handle SELECT for checking existing email
    if (text.includes('WHERE LOWER(email) = LOWER')) {
      const email = params[0];
      const found = memoryStore.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
      return { rows: found };
    }

    // Handle SELECT by id (for /me route)
    if (text.includes('WHERE id =')) {
      const id = params[0];
      const found = memoryStore.users.filter(u => u.id === id);
      // Return without password_hash if the SELECT specifies columns
      if (text.includes('SELECT id, full_name')) {
        return { rows: found.map(({ password_hash, ...rest }) => rest) };
      }
      return { rows: found };
    }

    // Handle SELECT * (for login - needs password_hash)
    if (text.includes('SELECT *') && text.includes('WHERE LOWER(email)')) {
      const email = params[0];
      const found = memoryStore.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
      return { rows: found };
    }

    // Handle INSERT (signup)
    if (text.trim().toUpperCase().startsWith('INSERT INTO USERS')) {
      const [full_name, company_name, email, password_hash] = params;
      const newUser = {
        id: crypto.randomUUID(),
        full_name,
        company_name,
        email,
        password_hash,
        role: 'employee',
        created_at: new Date().toISOString(),
      };
      memoryStore.users.push(newUser);
      // Return without password_hash (matches RETURNING clause)
      const { password_hash: _, ...userWithout } = newUser;
      return { rows: [userWithout] };
    }

    return { rows: [] };
  }
};

// Try to create a real PostgreSQL pool, fall back to memory if connection fails
let pool;

if (process.env.DATABASE_URL) {
  const realPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Test if we can actually connect
  try {
    await realPool.query('SELECT NOW()');
    pool = realPool;
    console.log('✅ Connected to PostgreSQL database.');
  } catch {
    pool = memoryPool;
    console.log('⚠️  PostgreSQL not reachable — using in-memory store (data resets on restart)');
  }
} else {
  pool = memoryPool;
  console.log('⚠️  No DATABASE_URL set — using in-memory store (data resets on restart)');
}

export default pool;

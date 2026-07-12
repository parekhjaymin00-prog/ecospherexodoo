import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './migrate.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';

// Validate JWT_SECRET at startup
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.trim() === '') {
  console.error('ERROR: JWT_SECRET environment variable is required but not set.');
  process.exit(1);
}

if (jwtSecret.length < 32) {
  console.error('WARNING: JWT_SECRET is less than 32 characters. Use a longer secret in production.');
}

// Database connection already tested in db.js
// Run migrations (no-op for in-memory mode)
await migrate();

// Create Express app
const app = express();

app.use(express.json());
app.use(cors());

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './migrate.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import departmentRoutes from './routes/departments.js';
import emissionFactorRoutes from './routes/emissionFactors.js';
import carbonTransactionRoutes from './routes/carbonTransactions.js';
import environmentalGoalRoutes from './routes/environmentalGoals.js';
import csrActivityRoutes from './routes/csrActivities.js';
import participationRoutes from './routes/participations.js';
import categoryRoutes from './routes/categories.js';
import policyRoutes from './routes/policies.js';
import auditRoutes from './routes/audits.js';
import complianceRoutes from './routes/compliance.js';
import challengeRoutes from './routes/challenges.js';
import badgeRoutes from './routes/badges.js';
import rewardRoutes from './routes/rewards.js';
import leaderboardRoutes from './routes/leaderboard.js';
import productProfileRoutes from './routes/productProfiles.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import trainingRoutes from './routes/training.js';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.trim() === '') { console.error('ERROR: JWT_SECRET environment variable is required.'); process.exit(1); }
if (jwtSecret.length < 32) { console.error('WARNING: JWT_SECRET is less than 32 characters.'); }

await migrate();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/emission-factors', emissionFactorRoutes);
app.use('/api/carbon-transactions', carbonTransactionRoutes);
app.use('/api/environmental-goals', environmentalGoalRoutes);
app.use('/api/csr-activities', csrActivityRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/compliance-issues', complianceRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/product-profiles', productProfileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/training', trainingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });

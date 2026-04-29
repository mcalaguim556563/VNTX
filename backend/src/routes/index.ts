import express from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import tournamentRoutes from './tournaments.routes';
import teamRoutes from './teams.routes';
import matchRoutes from './matches.routes';
import resultRoutes from './results.routes';
import standingRoutes from './standings.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/teams', teamRoutes);
router.use('/matches', matchRoutes);
router.use('/results', resultRoutes);
router.use('/standings', standingRoutes);

export default router;

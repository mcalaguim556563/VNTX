import express from 'express';
import { dashboardController } from '../controllers/dashboard.controller';

const router = express.Router();

router.get('/stats',                dashboardController.getStats);
router.get('/recent',               dashboardController.getRecent);
router.get('/upcoming',             dashboardController.getUpcoming);
router.get('/results-distribution', dashboardController.getResultsDistribution);
router.get('/analytics',            dashboardController.getAnalytics);

export default router;

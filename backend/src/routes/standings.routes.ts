import express from 'express';
import { standingController } from '../controllers/standings.controller';

const router = express.Router();

router.get('/tournament/:tournamentId', standingController.getByTournament);
router.post('/calculate/:tournamentId', standingController.calculate);
router.post('/recalculate/:tournamentId', standingController.calculate);  // alias
router.get('/debug/:tournamentId', standingController.debug);

export default router;

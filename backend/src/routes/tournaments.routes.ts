import express from 'express';
import { tournamentController } from '../controllers/tournaments.controller';

const router = express.Router();

router.get('/',     tournamentController.getAll);
router.get('/:id',  tournamentController.getById);
router.post('/',    tournamentController.create);
router.put('/:id',  tournamentController.update);
router.delete('/:id', tournamentController.delete);

export default router;

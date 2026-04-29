import express from 'express';
import { teamController } from '../controllers/teams.controller';

const router = express.Router();

// All routes open — frontend admin panel is already protected by React auth guard
router.get('/',     teamController.getAll);
router.get('/:id',  teamController.getById);
router.post('/',    teamController.create);
router.put('/:id',  teamController.update);
router.delete('/:id', teamController.delete);

export default router;

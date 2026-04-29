import express from 'express';
import { matchController } from '../controllers/matches.controller';

const router = express.Router();

router.get('/',     matchController.getAll);
router.get('/:id',  matchController.getById);
router.post('/',    matchController.create);
router.put('/:id',  matchController.update);
router.delete('/:id', matchController.delete);

export default router;

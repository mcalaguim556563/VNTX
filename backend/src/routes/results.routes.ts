import express from 'express';
import { resultController } from '../controllers/results.controller';

const router = express.Router();

router.get('/',     resultController.getAll);
router.get('/:id',  resultController.getById);
router.post('/',    resultController.create);
router.put('/:id',  resultController.update);
router.delete('/:id', resultController.delete);

export default router;

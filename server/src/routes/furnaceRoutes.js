import express from 'express';
import * as furnaceController from '../controllers/furnaceController.js';

const router = express.Router();

router.get('/', furnaceController.getAll);
router.get('/:id', furnaceController.getById);
router.post('/', furnaceController.create);
router.put('/:id', furnaceController.update);
router.delete('/:id', furnaceController.remove);

export default router;

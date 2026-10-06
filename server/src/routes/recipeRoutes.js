import express from 'express';
import * as recipeController from '../controllers/recipeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', recipeController.getAll);
router.post('/', recipeController.create);
router.post('/:id/approve', recipeController.approve);
router.delete('/:id', recipeController.deleteRecipe);

export default router;

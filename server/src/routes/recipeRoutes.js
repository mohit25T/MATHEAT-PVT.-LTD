import express from 'express';
import { Recipe } from '../models/Recipe.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = express.Router();

// GET /api/recipes
router.get('/', authenticate, async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate('process')
      .populate('part')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ recipeCode: 1, revision: -1 });
    res.json({ success: true, count: recipes.length, recipes });
  } catch (error) { next(error); }
});

// POST /api/recipes (Create new recipe or new revision)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER', 'QC_MANAGER'), async (req, res, next) => {
  try {
    const {
      recipeCode,
      recipeName,
      process: processId,
      part: partId,
      materialGrade,
      targetTemperature,
      soakingTimeMinutes,
      carbonPotential,
      quenchMedium,
      targetQuenchTemperature,
      temperingTemperature,
      temperingTimeMinutes,
      revisionReason
    } = req.body;

    // Check existing revisions
    const existing = await Recipe.find({ recipeCode: recipeCode.toUpperCase() }).sort({ createdAt: -1 });
    let revision = 'V1';
    if (existing.length > 0) {
      const highestRev = existing[0].revision;
      const revNum = parseInt(highestRev.replace('V', ''), 10) || 1;
      revision = `V${revNum + 1}`;
    }

    const recipe = await Recipe.create({
      recipeCode: recipeCode.toUpperCase(),
      recipeName,
      process: processId,
      part: partId || undefined,
      materialGrade: materialGrade.toUpperCase(),
      revision,
      targetTemperature,
      soakingTimeMinutes,
      carbonPotential,
      quenchMedium: quenchMedium || 'OIL',
      targetQuenchTemperature: targetQuenchTemperature || 60,
      temperingTemperature,
      temperingTimeMinutes,
      revisionReason,
      isApproved: false,
      createdBy: req.user._id
    });

    await logAudit({
      req,
      action: 'CREATE_RECIPE_REVISION',
      module: 'RECIPE',
      recordId: recipe._id,
      entityType: 'Recipe',
      newValue: { recipeCode, revision }
    });

    res.status(201).json({ success: true, recipe });
  } catch (error) { next(error); }
});

// POST /api/recipes/:id/approve (Only authorized QC/Metallurgy Manager can approve)
router.post('/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'QC_MANAGER'), async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    recipe.isApproved = true;
    recipe.approvedBy = req.user._id;
    recipe.approvalDate = new Date();
    await recipe.save();

    await logAudit({
      req,
      action: 'APPROVE_RECIPE',
      module: 'RECIPE',
      recordId: recipe._id,
      entityType: 'Recipe',
      description: `Recipe ${recipe.recipeCode} Rev ${recipe.revision} approved by ${req.user.username}`
    });

    res.json({ success: true, message: `Recipe ${recipe.recipeCode} Rev ${recipe.revision} approved.`, recipe });
  } catch (error) { next(error); }
});

export default router;

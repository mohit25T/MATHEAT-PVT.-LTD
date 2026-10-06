import { Recipe } from '../models/Recipe.js';
import { logAudit } from '../middleware/audit.js';

// 1. GET ALL RECIPES
export const getAll = async (req, res, next) => {
  try {
    const recipes = await Recipe.find()
      .populate('process')
      .populate('part')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ recipeCode: 1, revision: -1 });
    res.json({ success: true, count: recipes.length, recipes, data: recipes });
  } catch (error) { next(error); }
};

// 2. CREATE NEW RECIPE / REVISION
export const create = async (req, res, next) => {
  try {
    const {
      recipeCode,
      code,
      recipeName,
      name,
      process: processId,
      part: partId,
      materialGrade,
      targetTemperature,
      targetTemp,
      soakingTimeMinutes,
      soakMinutes,
      carbonPotential,
      quenchMedium,
      targetQuenchTemperature,
      quenchTemp,
      temperingTemperature,
      temperingTemp,
      temperingTimeMinutes,
      temperingTime,
      revisionReason
    } = req.body;

    const rCode = (recipeCode || code || `RCP-${(materialGrade || 'STD').toUpperCase()}`).toUpperCase().trim();
    const existing = await Recipe.find({ recipeCode: rCode }).sort({ createdAt: -1 });
    let revision = 'V1';
    if (existing.length > 0) {
      const highestRev = existing[0].revision || 'V1';
      const revNum = parseInt(highestRev.replace('V', ''), 10) || 1;
      revision = `V${revNum + 1}`;
    }

    const recipe = await Recipe.create({
      recipeCode: rCode,
      recipeName: recipeName || name || `${(materialGrade || 'Standard')} Heat Treatment Cycle`,
      process: processId || undefined,
      part: partId || undefined,
      materialGrade: (materialGrade || 'EN31').toUpperCase().trim(),
      revision,
      targetTemperature: Number(targetTemperature ?? targetTemp ?? 850),
      soakingTimeMinutes: Number(soakingTimeMinutes ?? soakMinutes ?? 90),
      carbonPotential: Number(carbonPotential ?? 0.9),
      quenchMedium: quenchMedium || 'OIL',
      targetQuenchTemperature: Number(targetQuenchTemperature ?? quenchTemp ?? 60),
      quenchTimeMinutes: Number(req.body.quenchTimeMinutes ?? 15),
      transferTimeSeconds: Number(req.body.transferTimeSeconds ?? 15),
      temperingTemperature: Number(temperingTemperature ?? temperingTemp ?? 180),
      temperingTimeMinutes: Number(temperingTimeMinutes ?? temperingTime ?? 120),
      coolingMethod: req.body.coolingMethod || 'Still Air Cool to Room Temp',
      requiredHardness: req.body.requiredHardness || '58-62 HRC',
      requiredCaseDepth: req.body.requiredCaseDepth || '0.80 - 1.10 mm',
      requiredCoreHardness: req.body.requiredCoreHardness || '32-40 HRC',
      distortionLimits: req.body.distortionLimits || 'Max 0.05 mm',
      revisionReason: revisionReason || 'Initial Release',
      isApproved: true,
      createdBy: req.user?._id
    });

    if (req.user) {
      await logAudit({
        req,
        action: 'CREATE_RECIPE_REVISION',
        module: 'RECIPE',
        recordId: recipe._id,
        entityType: 'Recipe',
        newValue: { recipeCode: rCode, revision }
      });
    }

    res.status(201).json({ success: true, recipe });
  } catch (error) { next(error); }
};

// 3. APPROVE RECIPE
export const approve = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    recipe.isApproved = true;
    recipe.approvedBy = req.user?._id;
    recipe.approvalDate = new Date();
    await recipe.save();

    res.json({ success: true, message: `Recipe ${recipe.recipeCode} Rev ${recipe.revision} approved.`, recipe });
  } catch (error) { next(error); }
};

// 4. DELETE RECIPE
export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) { next(error); }
};

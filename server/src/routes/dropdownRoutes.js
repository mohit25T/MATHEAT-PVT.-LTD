import express from 'express';
import {
  getAllDropdowns,
  getDropdownByKey,
  addDropdownOption,
  deleteDropdownOption
} from '../controllers/dropdownController.js';

const router = express.Router();

// GET /api/dropdowns - Retrieve all dropdown options across all categories
router.get('/', getAllDropdowns);

// GET /api/dropdowns/:key - Retrieve options for a specific dropdown category
router.get('/:key', getDropdownByKey);

// POST /api/dropdowns/:key/options - Add and store a custom option into the database
router.post('/:key/options', addDropdownOption);

// DELETE /api/dropdowns/:key/options/:value - Delete an option from a dropdown
router.delete('/:key/options/:value', deleteDropdownOption);

export default router;

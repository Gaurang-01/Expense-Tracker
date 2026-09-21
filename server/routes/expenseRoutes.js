import { Router } from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { validateExpense } from '../middleware/validate.js';

const router = Router();

// Protect all routes below
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(validateExpense, createExpense);

// Analytics — must be before /:id to avoid treating "analytics" as an ObjectId
router.get('/analytics', getAnalytics);

router.route('/:id')
  .get(getExpense)
  .put(validateExpense, updateExpense)
  .delete(deleteExpense);

export default router;

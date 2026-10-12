import { Router } from 'express';
import { getBudgets, upsertBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(getBudgets).post(upsertBudget);
router.route('/:id').delete(deleteBudget);

export default router;

import { Router } from 'express';
import { getIncomes, getIncome, createIncome, updateIncome, deleteIncome } from '../controllers/incomeController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(getIncomes).post(createIncome);
router.route('/:id').get(getIncome).put(updateIncome).delete(deleteIncome);

export default router;

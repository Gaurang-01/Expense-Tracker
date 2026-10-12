import { Router } from 'express';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '../controllers/investmentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(getInvestments).post(createInvestment);
router.route('/:id').put(updateInvestment).delete(deleteInvestment);

export default router;

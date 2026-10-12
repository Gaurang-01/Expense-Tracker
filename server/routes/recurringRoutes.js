import { Router } from 'express';
import { getRecurring, createRecurring, updateRecurring, deleteRecurring } from '../controllers/recurringController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(getRecurring).post(createRecurring);
router.route('/:id').put(updateRecurring).delete(deleteRecurring);

export default router;

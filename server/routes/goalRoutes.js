import { Router } from 'express';
import { getGoals, createGoal, updateGoal, contributeToGoal, deleteGoal } from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
router.post('/:id/contribute', contributeToGoal);

export default router;

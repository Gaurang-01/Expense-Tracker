import { Router } from 'express';
import {
  getGroups,
  createGroup,
  inviteMember,
  addGroupExpense,
  settleSplit,
  deleteGroup,
} from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.route('/').get(getGroups).post(createGroup);
router.route('/:id').delete(deleteGroup);
router.post('/:id/invite', inviteMember);
router.post('/:id/expenses', addGroupExpense);
router.put('/:id/expenses/:expenseId/settle/:memberId', settleSplit);

export default router;

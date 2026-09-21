import { Router } from 'express';
import { getUsers, createUser, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes and restrict to admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

export default router;


import { Router } from 'express';
import { getNotifications, markRead, markAllRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', getNotifications);
// read-all must come before /:id to avoid treating "read-all" as an ObjectId
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;

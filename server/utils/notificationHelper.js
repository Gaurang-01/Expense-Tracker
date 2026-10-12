import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

/**
 * Create a persisted notification and deliver it live over Socket.IO
 * @param {object} opts
 * @param {string|object} opts.user - User ID (string or ObjectId)
 * @param {string} opts.title - Short title
 * @param {string} opts.message - Full message body
 * @param {string} [opts.type] - Notification type enum value
 * @param {string} [opts.refModel] - Related model name
 * @param {string|object} [opts.refId] - Related document ID
 */
export async function createAndDeliverNotification({ user, title, message, type = 'info', refModel, refId }) {
  try {
    const notif = await Notification.create({
      user,
      title,
      message,
      type,
      ...(refModel ? { refModel } : {}),
      ...(refId ? { refId } : {}),
    });

    try {
      const io = getIO();
      if (io) {
        io.to(user.toString()).emit('notification:new', notif);
      }
    } catch (socketErr) {
      console.warn('[Notify] Socket emit error:', socketErr.message);
    }

    return notif;
  } catch (err) {
    console.error('[Notify] Failed to create notification:', err.message);
  }
}

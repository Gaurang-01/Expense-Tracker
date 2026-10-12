import { Server } from 'socket.io';
import socketAuth from './middleware/socketAuth.js';

let io = null;

/**
 * Initialize Socket.IO server with CORS and authentication middleware
 * @param {import('http').Server} httpServer
 * @param {object} corsConfig
 * @returns {Server}
 */
export const initSocket = (httpServer, corsConfig) => {
  io = new Server(httpServer, {
    cors: corsConfig,
    pingTimeout: 60000,
  });

  // Attach authentication middleware
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    // Join room scoped to userId
    if (socket.userId) {
      socket.join(socket.userId);
      console.log(`[Socket.IO] Authenticated user joined room: ${socket.userId} (socket ${socket.id})`);

      // Dynamically join all group rooms the user belongs to
      try {
        const { default: Group } = await import('./models/Group.js');
        const groups = await Group.find({ members: socket.userId }, '_id');
        for (const g of groups) {
          socket.join(`group:${g._id}`);
        }
      } catch (err) {
        console.warn('[Socket.IO] Group room join error:', err.message);
      }
    }

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Socket ${socket.id} disconnected (${reason})`);
    });
  });

  return io;
};

/**
 * Retrieve the active Socket.IO instance
 * @returns {Server|null}
 */
export const getIO = () => {
  return io;
};

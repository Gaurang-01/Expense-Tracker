import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token passed in socket.handshake.auth.token
 * Attaches socket.userId and socket.user, joins socket to personal room
 */
export const socketAuth = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    // Fallback: check authorization header if not provided in handshake.auth
    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token using same secret as REST auth middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return next(new Error('Authentication error: Invalid token payload'));
    }

    // Optional: confirm user exists in DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error: User no longer exists'));
    }

    // Attach verified user ID and data to socket
    socket.userId = decoded.id.toString();
    socket.user = user;

    next();
  } catch (err) {
    return next(new Error(`Authentication error: ${err.message}`));
  }
};

export default socketAuth;

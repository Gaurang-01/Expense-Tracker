import { io } from 'socket.io-client';

// Compute backend socket origin if custom URL provided, otherwise fallback to relative origin
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')
    ? new URL(import.meta.env.VITE_API_URL).origin
    : undefined
);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem('token');
    cb({ token });
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

/**
 * Connect socket instance with current JWT token
 */
export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Disconnect socket instance
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;

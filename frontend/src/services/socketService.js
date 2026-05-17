import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => console.log('🔗 Socket connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('❌ Socket disconnected:', reason));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Convenience emit wrapper
export const emit = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data);
  }
};

export default { connectSocket, disconnectSocket, getSocket, emit };

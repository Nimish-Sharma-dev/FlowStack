import { useEffect, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService';

export const useSocket = (projectId, userId, userName) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!projectId || !userId) return;
    const socket = connectSocket();
    socketRef.current = socket;
    socket.emit('join_project', { projectId, userId, userName });
    return () => {
      socket.emit('leave_project', { projectId });
    };
  }, [projectId, userId, userName]);

  const on = useCallback((event, handler) => {
    const socket = getSocket();
    if (socket) socket.on(event, handler);
    return () => { if (socket) socket.off(event, handler); };
  }, []);

  const emit = useCallback((event, data) => {
    const socket = getSocket();
    if (socket?.connected) socket.emit(event, data);
  }, []);

  return { on, emit, socket: socketRef };
};

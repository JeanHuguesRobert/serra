import { io } from 'socket.io-client';
import { EventEmitter } from 'events';
import { SOCKET_EVENTS } from '../../../core/src/constants/events.js';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    console.log('[Socket] Creating socket connection');
    socketInstance = io('http://localhost:3000', {
      reconnection: false
    });

    // Add logging
    const emit = socketInstance.emit.bind(socketInstance);
    socketInstance.emit = (event, ...args) => {
      console.log('[Socket] OUT >>>', event, ...args);
      return emit(event, ...args);
    };

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
  }

  return socketInstance;
};

export const socket = getSocket();
export default socket;
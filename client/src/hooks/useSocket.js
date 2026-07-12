import { useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket/socket.js';

export const useSocket = (events = {}) => {
  const eventListeners = useRef(new Map());

  useEffect(() => {
    // Clear any existing listeners first
    eventListeners.current.forEach((handler, event) => {
      console.log('[Socket] Cleaning up old listener:', event);
      socket.off(event, handler);
    });
    eventListeners.current.clear();

    // Add new listeners
    Object.entries(events).forEach(([event, handler]) => {
      console.log('[Socket] Adding new listener:', event);
      socket.on(event, handler);
      eventListeners.current.set(event, handler);
    });

    return () => {
      eventListeners.current.forEach((handler, event) => {
        console.log('[Socket] Removing listener:', event);
        socket.off(event, handler);
      });
    };
  }, [events]);

  return { socket };
};
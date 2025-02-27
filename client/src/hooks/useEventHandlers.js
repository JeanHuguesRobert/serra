import { useEffect, useCallback } from 'react';
import { SOCKET_EVENTS } from '../../../core/src/constants/events';

export function useEventHandlers({ on, emit, dispatch }) {
  const setupHandlers = useCallback(() => {
    if (!on) return [];

    const handlers = {
      [SOCKET_EVENTS.CHAT.WELCOME]: (response) => {
        dispatch(addMessage({ text: response.message, sender: 'system' }));
      },
      [SOCKET_EVENTS.CHAT.RESPONSE]: (response) => {
        // ...existing chat response handling...
      }
    };

    return Object.entries(handlers).map(([event, handler]) => {
      return on(event, handler);
    });
  }, [on, dispatch]);

  useEffect(() => {
    const unsubscribes = setupHandlers();
    return () => unsubscribes.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
  }, [setupHandlers]);
}

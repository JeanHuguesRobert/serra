import { useCallback } from 'react';
import { useEngine } from '../contexts/EngineContext';
import { COMMAND_TYPES } from '../../../core/src/constants/events';

export function useCommandProcessor({ emit, dispatch, addMessage }) {
  const { engine } = useEngine();

  return useCallback((command) => {
    const timestamp = new Date().toISOString();
    console.log(`[Command] Processing at ${timestamp}:`, command);

    if (command.startsWith('/start') || command.startsWith('/stop')) {
      if (!engine) {
        console.warn('[Command] Engine not available');
        return false;
      }

      const isStart = command === '/start';
      isStart ? engine.start() : engine.stop();
      console.log(`[Command] Engine ${isStart ? 'started' : 'stopped'}`);
      
      dispatch(addMessage({
        text: `Engine ${isStart ? 'started' : 'stopped'}`,
        sender: 'system'
      }));
      return true;
    }

    if (command.startsWith('/')) {
      emit('chat:command', { command: command.slice(1) });
      return true;
    }

    return false;
  }, [engine, emit, dispatch, addMessage]);
}

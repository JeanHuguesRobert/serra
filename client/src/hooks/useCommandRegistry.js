import { useCallback } from 'react';
import { useEngine } from '../contexts/EngineContext';
import { COMMAND_TYPES } from '../../../core/src/constants/events';
import { createSystemMessage, createErrorMessage } from '../utils/messageHandler';

export function useCommandRegistry({ emit, dispatch, addMessage }) {
  const { engine } = useEngine();

  const executeCommand = useCallback(async (command, args) => {
    if (!engine?.commandProcessor) {
      dispatch(addMessage(createErrorMessage('Command processor not available')));
      return false;
    }

    try {
      const result = await engine.commandProcessor.processCommand(command, args);
      dispatch(addMessage(createSystemMessage(result.message)));
      return result.success;
    } catch (error) {
      dispatch(addMessage(createErrorMessage(error.message)));
      return false;
    }
  }, [engine, dispatch, addMessage]);

  return { executeCommand };
}

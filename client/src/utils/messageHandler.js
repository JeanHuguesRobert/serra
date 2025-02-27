import { MESSAGE_TYPES } from '../constants/ui';

export const createSystemMessage = (text, options = {}) => ({
  text,
  sender: MESSAGE_TYPES.SYSTEM,
  timestamp: new Date().toISOString(),
  ...options
});

export const createUserMessage = (text) => ({
  text,
  sender: MESSAGE_TYPES.USER,
  timestamp: new Date().toISOString()
});

export const createErrorMessage = (text) => 
  createSystemMessage(text, { error: true });

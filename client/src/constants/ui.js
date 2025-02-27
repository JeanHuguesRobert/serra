export const STATUS_TYPES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RUNNING: 'running',
  STOPPED: 'stopped'
};

export const STATUS_COLORS = {
  [STATUS_TYPES.CONNECTED]: '#4caf50',
  [STATUS_TYPES.DISCONNECTED]: '#f44336',
  [STATUS_TYPES.ERROR]: '#f44336',
  [STATUS_TYPES.RUNNING]: '#4caf50',
  [STATUS_TYPES.STOPPED]: '#f44336',
  default: '#ffa726'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  SYSTEM: 'system'
};

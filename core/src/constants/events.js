export const SOCKET_EVENTS = {
  // Internal socket.io events (do not emit these)
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect_attempt',
  
  // Custom connection events
  CONNECTION: {
    STATUS: 'connection:status',
    READY: 'connection:ready',
    LOST: 'connection:lost'
  },
  CHAT: {
    WELCOME: 'chat:welcome',
    RESPONSE: 'chat:response',
    MESSAGE: 'chat:message',
    HELP: 'chat:help'  // Ensure this is properly defined
  },
  ENGINE: {
    START: 'engine-started',
    STOP: 'engine-stopped',
    STATE: 'state-update',
    COMMAND: 'engine:command',     // Server -> Client command
    COMMAND_RESULT: 'engine:command-result',  // Client -> Server result
    RUN: 'engine:run',
    RUN_RESULT: 'engine:run-result',
    JOB_SUBMIT: 'engine:job:submit',
    JOB_STATUS: 'engine:job:status',
    JOB_OUTPUT: 'engine:job:output',
    JOB_ERROR: 'engine:job:error',
    JOB_COMPLETE: 'engine:job:complete'
  }
};

export const COMMAND_TYPES = {
  DASHBOARD: {
    SWITCH: 'dashboard.switch',
    CREATE: 'dashboard.create',
    DELETE: 'dashboard.delete',
    REFRESH: 'dashboard.refresh'
  },
  ELEMENT: {
    CREATE: 'element.create',
    UPDATE: 'element.update',
    DELETE: 'element.delete'
  },
  SYSTEM: {
    START: 'system:start',
    STOP: 'system:stop',
    RELOAD: 'system:reload'
  },
  AUDIO: {
    PLAY: 'audio:play',
    PAUSE: 'audio:pause',
    STOP: 'audio:stop',
    SKIP: 'audio:skip'
  }
};

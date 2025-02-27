import { EventEmitter } from 'events';
import { COMMAND_TYPES } from '../constants/events.js';

export class CommandRegistry extends EventEmitter {
  constructor() {
    super();
    this.commands = new Map();
    this.registerDefaultCommands();
  }

  registerCommand(type, handler, options = {}) {
    this.commands.set(type, { handler, ...options });
  }

  getCommand(type) {
    return this.commands.get(type);
  }

  registerDefaultCommands() {
    Object.entries(COMMAND_TYPES).forEach(([category, commands]) => {
      Object.entries(commands).forEach(([name, type]) => {
        this.registerCommand(type, {
          validate: (args) => this.validateArgs(type, args),
          execute: (args) => this.executeCommand(type, args)
        });
      });
    });
  }

  // ...existing validation and execution logic...
}

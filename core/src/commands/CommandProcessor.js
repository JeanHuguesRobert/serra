import { COMMAND_TYPES } from '../constants/events.js';
import { CommandRegistry } from './CommandRegistry.js';

export class CommandProcessor {
  constructor() {
    this.registry = new CommandRegistry();
  }

  async process(command) {
    const handler = this.registry.getCommand(command.type);
    if (!handler) {
      throw new Error(`Unknown command type: ${command.type}`);
    }
    return await handler.execute(command);
  }
}
import { EventEmitter } from 'events';

export class Transport extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  async connect() {
    throw new Error('Transport.connect() must be implemented by subclass');
  }

  async disconnect() {
    throw new Error('Transport.disconnect() must be implemented by subclass');
  }

  async send(message) {
    throw new Error('Transport.send() must be implemented by subclass');
  }
}
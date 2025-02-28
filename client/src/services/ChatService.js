import { ChatService } from '@serra/core';
import { SocketCore } from './core/SocketCore';

class BrowserChatService extends ChatService {
  constructor(config = {}) {
    super();
    this.socket = new SocketCore(config);
  }

  async connect() {
    await this.socket.connect();
  }

  async sendMessage(message, systemPrompt = '') {
    if (!this.socket.isConnected()) {
      throw new Error('Socket not connected');
    }

    const messagePayload = {
      ...message,
      provider: this.aiProvider,
      systemPrompt
    };

    this._addToHistory({
      ...message,
      direction: 'outgoing'
    });

    return new Promise((resolve, reject) => {
      this.socket.emit('message', messagePayload, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          this._addToHistory({
            ...response,
            direction: 'incoming'
          });
          
          this.emit('message', response);
          resolve(response);
        }
      });
    });
  }

  setupListeners() {
    this.socket.on('message', (message) => {
      this._addToHistory({
        ...message,
        direction: 'incoming'
      });
      
      this.emit('message', message);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default new BrowserChatService();
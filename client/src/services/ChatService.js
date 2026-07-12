import { ChatService } from '@serra/core';
import { useSocket } from '../contexts/SocketContext';

class BrowserChatService extends ChatService {
  constructor(config = {}) {
    super();
    this.transport = null;
    this.aiProvider = config.aiProvider || 'default';
    this.debug = true;
    this.messageHistory = [];
  }

  async initialize(transport) {
    this.transport = transport;
    
    this.transport.on('message', (message) => {
      if (message.protocol === 'serra' && message.type === 'chat') {
        this._addToHistory({
          ...message.data,
          direction: 'incoming'
        });
        this.emit('message', message.data);
      }
    });
  }

  async sendMessage(message, systemPrompt = '') {
    if (!this.transport || !this.transport.isConnected()) {
      throw new Error('Transport not connected');
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

    await this.transport.send({
      type: 'chat',
      data: messagePayload
    }, {
      protocol: 'serra'
    });
  }

  getHistory(limit = 50) {
    return this.messageHistory.slice(-limit);
  }

  clearHistory() {
    this.messageHistory = [];
  }

  _addToHistory(message) {
    this.messageHistory.push({
      ...message,
      timestamp: Date.now()
    });

    // Keep history size reasonable
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }
  }
}

// Create singleton instance
const chatService = new BrowserChatService();

// Hook to initialize chat service with socket from context
export const useChatService = () => {
  const { transport } = useSocket();
  
  React.useEffect(() => {
    if (transport) {
      chatService.initialize(transport);
    }
  }, [transport]);

  return chatService;
};

export default chatService;
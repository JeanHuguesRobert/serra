class ChatService {
  constructor() {
    this.activeUsers = new Map();
  }

  handleConnection(socket) {
    // Add user to active users
    this.activeUsers.set(socket.id, {
      socketId: socket.id,
      connected: true,
      lastActive: new Date()
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.activeUsers.delete(socket.id);
    });

    // Handle chat messages
    socket.on('chat:message', (message) => {
      // Broadcast message to all connected clients
      socket.broadcast.emit('chat:message', {
        userId: socket.id,
        message,
        timestamp: new Date()
      });
    });

    // Handle typing status
    socket.on('chat:typing', (isTyping) => {
      socket.broadcast.emit('chat:typing', {
        userId: socket.id,
        isTyping
      });
    });
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
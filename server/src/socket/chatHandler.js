const handleChat = (io, socket) => {
  console.log('Chat handler initialized for socket:', socket.id);

  socket.on('chat:init', () => {
    console.log('Received chat:init from:', socket.id);
    socket.emit('chat:welcome', {
      message: 'Hello, not ready yet, see you soon :)'
    });
    console.log('Sent welcome message to:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Chat disconnected:', socket.id);
  });
};

module.exports = handleChat;
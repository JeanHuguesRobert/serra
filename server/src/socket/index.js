const handleChat = require('./chatHandler');

const setupSocket = (io) => {
  console.log('Setting up socket server...');

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Initialize chat handler
    handleChat(io, socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  io.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
};

module.exports = setupSocket;
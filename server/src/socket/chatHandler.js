import chatService from '../services/ChatService.js';

export default function handleChat(io, socket) {
  // Initialize chat connection using the centralized service
  chatService.handleConnection(socket);
}
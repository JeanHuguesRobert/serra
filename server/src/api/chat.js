import express from 'express';
import { domain } from '../../../core/src/utils/denbug.js';
import { ChatService } from '../../../core/src/services/ChatService.js';

const router = express.Router();
const logger = domain('ChatAPI');

// Store the last connected client's socket
let lastConnectedSocket = null;

// Initialize chat service
const chatService = new ChatService();

// Update last connected client when a new client connects
function setLastConnectedSocket(socket) {
    const previousSocketId = lastConnectedSocket ? lastConnectedSocket.id : 'none';
    lastConnectedSocket = socket;
    logger.debug(`Socket connection updated - Previous: ${previousSocketId}, New: ${socket.id}`);
}

// Handle root chat endpoint
router.post('/', async (req, res) => {
    try {
        const { message, type } = req.body;
        logger.debug('Processing incoming chat request');
        logger.info(`Received chat message: ${JSON.stringify(req.body)}`);
        
        if (!message || !type) {
            logger.warn('Request validation failed: Missing message content or type');
            return res.status(400).json({ error: 'Message content and type are required' });
        }

        if (!lastConnectedSocket) {
            logger.warn('Message delivery failed: No connected client available');
            return res.status(404).json({ error: 'No connected client available' });
        }

        // Process the message and generate AI response
        logger.debug(`Processing message from client ${lastConnectedSocket.id}`);
        
        // Generate AI response
        const aiResponse = {
            type: 'ai',
            text: message.text === 'hi' ? 'Hello! How can I assist you today?' : 'I understand you said: ' + message.text,
            messageId: Date.now().toString()
        };
        
        // Add messages to chat service history
        chatService._addToHistory(message);
        chatService._addToHistory(aiResponse);
        
        // Emit the AI response to the connected client
        logger.debug(`Sending AI response to client ${lastConnectedSocket.id}`);
        lastConnectedSocket.emit('chat-message', aiResponse);
        logger.info(`Message successfully delivered to client ${lastConnectedSocket.id}`);

        res.json({ 
            success: true, 
            message: 'Message sent successfully',
            clientId: lastConnectedSocket.id
        });
    } catch (error) {
        logger.error(`Chat request processing failed: ${error.message}`);
        logger.debug(`Error stack trace: ${error.stack}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the socket connection updater and router
export { setLastConnectedSocket };
export default router;
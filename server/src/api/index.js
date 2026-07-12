import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import routes from './routes';
import { setupWebRTCHandlers } from '../services/WebRTCService';

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://serra.vercel.app'] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Parse JSON payloads
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://serra.vercel.app']
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  setupWebRTCHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Development server fallback
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static('client/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../../client/dist/index.html'));
  });
}

export { app, server, io };

/*
Instructions:

1. Server Setup
   - Express application initialization
   - HTTP server creation
   - Socket.IO integration

2. Middleware Configuration
   - CORS setup for both HTTP and WebSocket
   - JSON body parsing
   - Static file serving in development

3. API Routes
   - Health check endpoint (/health)
   - API routes mounted at /api
   - Development fallback route

4. WebSocket Handling
   - Socket.IO connection events
   - WebRTC signaling setup
   - Disconnect handling

5. Environment Configuration
   - Production vs Development settings
   - CORS origins based on environment
   - Static file serving in development

*/
/**
 * Main server entry point for Serra application.
 * Handles all server-side functionality including:
 * - API routes
 * - WebSocket connections
 * - Documentation serving
 * - Static file serving
 */

import express from 'express';
import cors from 'cors';
import { createSecureServer } from 'http2';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';

import denbug from '../../core/src/utils/denbug.js';
const debug = denbug;
import { Core } from '../../core/src/Core.js';
import { DocumentationService } from './services/documentationService.js';
import { AIService } from './services/aiService.js';
import { WebSocketTransport } from '../../core/src/services/WebSocketTransport.js';
import { connectionStatusService } from '../../core/src/services/ConnectionStatusService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Load SSL/TLS certificates
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

const httpServer = http.createServer(app);
const http2Server = createSecureServer(options, app);

// Create AI service and setup socket server
const ai = new AIService();
const io = ai.setupServer(http2Server);

const documentation = new DocumentationService();

// HTTP request/response tracing middleware
app.use((req, res, next) => {
  debug.traceHttpRequest(req);
  
  // Capture response using response finish event
  const originalEnd = res.end;
  res.end = function(...args) {
    debug.traceHttpResponse(res);
    return originalEnd.apply(res, args);
  };
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' 
    ? err.message : undefined
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: process.env.npm_package_version,
    uptime: process.uptime()
  });
});

// Documentation routes
app.use('/api/docs', async (req, res) => {
  try {
    const filename = req.path.slice(1); // Remove leading slash
    const content = await documentation.getDocumentation(filename);
    res.type('text/markdown').send(content);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// Serve static files from the client/dist directory
app.use(express.static(join(__dirname, '../../client/dist')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

const trace = debug.domain('Serra');
trace.enable();
console.assert(trace.enabled());
debug.enable("Serra:echo");
console.assert(debug.enabled("Serra:echo"));

trace('Starting server...');

// Initialize core and transports
const core = new Core();
const webSocketTransport = new WebSocketTransport(httpServer);

// Handle WebRTC signaling through WebSocket
webSocketTransport.io.on('connection', (socket) => {
  // Handle WebRTC signaling
  socket.on('webrtc_offer', async (data) => {
    const { peerId, offer } = data;
    try {
      const answer = await webRTCTransport.handleOffer(peerId, offer);
      socket.emit('webrtc_answer', { peerId, answer });
    } catch (error) {
      trace.error('Error handling WebRTC offer:', error);
    }
  });

  socket.on('webrtc_answer', async (data) => {
    const { peerId, answer } = data;
    try {
      await webRTCTransport.handleAnswer(peerId, answer);
    } catch (error) {
      trace.error('Error handling WebRTC answer:', error);
    }
  });

  socket.on('webrtc_ice_candidate', async (data) => {
    const { peerId, candidate } = data;
    try {
      await webRTCTransport.handleIceCandidate(peerId, candidate);
    } catch (error) {
      trace.error('Error handling ICE candidate:', error);
    }
  });
});

// Set desired connection status
connectionStatusService.setDesiredStatus('up');

// Register and connect transport
core.registerTransport('websocket', webSocketTransport);
await webSocketTransport.connect();

trace('WebSocket transport initialized');

// Add connection status monitoring
connectionStatusService.on('statusChange', (state) => {
  trace('Transport status changed:', state);
});

// Start servers
httpServer.listen(PORT, () => {
  trace(`HTTP server running on port ${PORT}`);
});

http2Server.listen(PORT + 1, () => {
  trace(`HTTP/2 server running on port ${PORT + 1}`);
});

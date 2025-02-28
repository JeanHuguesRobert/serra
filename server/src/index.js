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
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { DocumentationService } from './services/documentationService.js';
import { AIService } from './services/aiService.js';
import authRouter from './api/auth.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize services
const documentation = new DocumentationService();
const aiService = new AIService();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
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

// Get the directory path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the client/dist directory
app.use(express.static(join(__dirname, '../../client/dist')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
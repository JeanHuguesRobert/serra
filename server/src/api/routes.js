import express from 'express';
import chatRouter from './chat.js';
import { agentsRouter } from './agents.js';
import { aiProvidersRouter } from './ai-providers.js';
import dashboardsRouter, { setupDashboardRoutes } from './dashboards.js';
import { DocumentationService } from '../../../core/src/services/DocumentationService.js';

export function setupRoutes(app, engine) {
  const documentation = new DocumentationService();

  // HTTPS redirect middleware for API requests
  app.use('/api', (req, res, next) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(`https://${req.headers.host}${req.url}`);
    } else {
      next();
    }
  });

  // WebSocket upgrade handling
  app.get('/socket.io/*', (req, res, next) => {
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket' ||
        req.headers.connection && req.headers.connection.toLowerCase().includes('upgrade')) {
      return next();
    }
    
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(`https://${req.headers.host}${req.url}`);
    } else {
      next();
    }
  });

  // Static assets handling with cache control
  app.get('/assets/*', (req, res, next) => {
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Vary': 'Accept-Encoding'
    });
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      engineState: engine.state.current()
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

  app.use('/api/chat', chatRouter);
  app.use('/api/agents', agentsRouter);
  app.use('/api/ai-providers', aiProvidersRouter);
  app.use('/api/dashboards', setupDashboardRoutes(app, engine));

  // Client-side routing - serve index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: './client/dist' });
  });
}
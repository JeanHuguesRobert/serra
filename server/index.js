const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const dashboardManager = require('./services/dashboardManager');
const aiService = require('./services/aiService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: process.env.npm_package_version,
    uptime: process.uptime()
  });
});
// Documentation route
app.get('/docs/:file', (req, res) => {
  const filePath = path.join(__dirname, '..', 'docs', req.params.file);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('Documentation not found');
      return;
    }
    const html = marked.parse(data);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Serra API Documentation</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css">
          <style>
            .markdown-body {
              box-sizing: border-box;
              min-width: 200px;
              max-width: 980px;
              margin: 0 auto;
              padding: 45px;
            }
          </style>
        </head>
        <body class="markdown-body">
          ${html}
        </body>
      </html>
    `);
  });
});
// Add new routes
app.get('/api/dashboard/:id', async (req, res) => {
  const dashboard = await dashboardManager.getDashboard(req.params.id);
  if (dashboard) {
    res.json(dashboard);
  } else {
    res.status(404).json({ error: 'Dashboard not found' });
  }
});

// Update WebSocket handling
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send initial dashboard on connection
    dashboardManager.getInitialDashboard()
      .then(dashboard => {
        console.log('Sending initial dashboard:', dashboard);
        socket.emit('dashboard-refresh', dashboard);
      })
      .catch(error => {
        console.error('Error loading initial dashboard:', error);
      });
    socket.on('request-dashboard', (dashboardId) => {
      console.log('Dashboard requested:', dashboardId);
      dashboardManager.getDashboard(dashboardId || 'first')
        .then(dashboard => {
          console.log('Sending requested dashboard:', dashboard);
          socket.emit('dashboard-refresh', dashboard);
        })
        .catch(error => {
          console.error('Error loading requested dashboard:', error);
          socket.emit('dashboard-error', { message: 'Failed to load dashboard' });
        });
    });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  socket.on('chat-message', (message) => {
    console.log('Received chat message:', message);
    aiService.processMessage(message, socket);
  });
  socket.on('dashboard-update', (data) => {
    // Handle dashboard updates
    io.emit('dashboard-refresh', data);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
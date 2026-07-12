/**
 * @fileoverview MCP Gateway implementation for Serra
 * Provides Model Context Protocol server functionality for web clients
 * 
 * @version 1.0.0
 * @license MIT
 */

import express from 'express';
import { Core } from '../../core/src/Core.js';

/**
 * MCP Gateway class for exposing Serra functionality through the Model Context Protocol
 */
export class MCPGateway {
  /**
   * Create a new MCP Gateway
   * @param {Object} options - Configuration options
   * @param {number} options.port - Port to listen on for HTTP connections
   * @param {string} options.name - Name of the MCP server
   * @param {string} options.version - Version of the MCP server
   */
  constructor(options = {}) {
    this.options = {
      port: 3001,
      name: 'Serra MCP Gateway',
      version: '1.0.0',
      ...options
    };
    
    this.app = express();
    this.core = new Core();
    this.setupCore();
    this.setupHTTPRoutes();
  }
  
  /**
   * Set up the core system with MCP transport
   */
  setupCore() {
    // Register the MCP transport
    this.core.registerTransport('mcp', new MCPTransport({
      name: this.options.name,
      version: this.options.version,
      transportType: 'stdio' // Default to stdio for direct integration
    }));
  }
  
  /**
   * Set up HTTP routes for SSE-based MCP connections
   */
  setupHTTPRoutes() {
    // SSE endpoint for MCP connections
    this.app.get('/mcp/sse', async (req, res) => {
      try {
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Create an MCP transport with SSE
        const mcpTransport = new MCPTransport({
          name: this.options.name,
          version: this.options.version,
          transportType: 'sse',
          res: res,
          postEndpoint: '/mcp/messages'
        });
        
        // Register the transport and create a dialog
        this.core.registerTransport('mcp-sse', mcpTransport);
        await this.core.createDialog('mcp-sse');
        
        // Handle client disconnect
        req.on('close', () => {
          console.log('Client disconnected from MCP SSE');
        });
      } catch (error) {
        console.error('Error setting up MCP SSE:', error);
        res.status(500).end();
      }
    });
    
    // Message endpoint for MCP
    this.app.post('/mcp/messages', express.json(), async (req, res) => {
      try {
        // Get the transport and handle the message
        const transport = this.core.transports.get('mcp-sse');
        if (transport && transport.transport) {
          await transport.transport.handlePostMessage(req, res);
        } else {
          res.status(400).json({ error: 'No active MCP SSE transport' });
        }
      } catch (error) {
        console.error('Error handling MCP message:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
  
  /**
   * Start the MCP Gateway server
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve) => {
      const server = this.app.listen(this.options.port, () => {
        console.log(`MCP Gateway listening on port ${this.options.port}`);
        resolve();
      });
    });
  }
  
  /**
   * Register a resource with the MCP server
   * @param {string} name - Resource name
   * @param {string|ResourceTemplate} template - Resource template or URI
   * @param {Function} handler - Resource handler function
   */
  registerResource(name, template, handler) {
    const transport = this.core.transports.get('mcp');
    if (transport) {
      transport.registerResource(name, template, handler);
    }
  }
  
  /**
   * Register a tool with the MCP server
   * @param {string} name - Tool name
   * @param {Object} params - Tool parameters schema (using zod)
   * @param {Function} handler - Tool handler function
   */
  registerTool(name, params, handler) {
    const transport = this.core.transports.get('mcp');
    if (transport) {
      transport.registerTool(name, params, handler);
    }
  }
  
  /**
   * Register a prompt with the MCP server
   * @param {string} name - Prompt name
   * @param {Object} params - Prompt parameters schema (using zod)
   * @param {Function} handler - Prompt handler function
   */
  registerPrompt(name, params, handler) {
    const transport = this.core.transports.get('mcp');
    if (transport) {
      transport.registerPrompt(name, params, handler);
    }
  }
}
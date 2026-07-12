/**
 * @fileoverview Example MCP server implementation for Serra
 * Shows how to set up and use the MCP Gateway
 * 
 * @version 1.0.0
 * @license MIT
 */

import { MCPGateway } from './mcp-gateway.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Start an MCP server for Serra
 */
async function startMCPServer() {
  // Create the MCP Gateway
  const mcpGateway = new MCPGateway({
    port: 3001,
    name: 'Serra MCP Server',
    version: '1.0.0'
  });
  
  // Register example resources
  mcpGateway.registerResource(
    'documentation',
    new ResourceTemplate('docs://{topic}', { list: undefined }),
    async (uri, { topic }) => {
      // In a real implementation, this would fetch documentation from Serra's documentation service
      return {
        contents: [{
          uri: uri.href,
          text: `Documentation for ${topic}`
        }]
      };
    }
  );
  
  // Register example tools
  mcpGateway.registerTool(
    'execute-command',
    { command: z.string() },
    async ({ command }) => {
      // In a real implementation, this would execute a command in Serra
      return {
        content: [{ 
          type: 'text', 
          text: `Executed command: ${command}` 
        }]
      };
    }
  );
  
  // Register example prompts
  mcpGateway.registerPrompt(
    'analyze-data',
    { data: z.string() },
    ({ data }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze this data:\n\n${data}`
        }
      }]
    })
  );
  
  // Start the MCP Gateway
  await mcpGateway.start();
  console.log('MCP Server started successfully');
}

// Start the MCP server when this file is executed directly
if (import.meta.url === import.meta.main) {
  startMCPServer().catch(error => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export { startMCPServer };
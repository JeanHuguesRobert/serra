import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EventEmitter } from 'events';

class MCPService extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
        this.server = new McpServer({
            name: 'Serra MCP Server',
            version: '1.0.0'
        });
    }

    async initialize() {
        // Register default resources
        this.server.resource(
            'documentation',
            'docs://serra',
            async (uri) => ({
                contents: [{
                    uri: uri.href,
                    text: 'Serra Documentation'
                }]
            })
        );

        // Register default tools
        this.server.tool(
            'execute-command',
            { command: z.string() },
            async ({ command }) => {
                try {
                    // Execute command through Serra's command processor
                    const result = await this.options.commandProcessor.execute(command);
                    return {
                        content: [{ type: 'text', text: JSON.stringify(result) }]
                    };
                } catch (error) {
                    return {
                        content: [{ type: 'text', text: `Error: ${error.message}` }],
                        isError: true
                    };
                }
            }
        );

        this.emit('initialized');
    }

    async connectTransport(transport) {
        await this.server.connect(transport);
        this.emit('connected', transport);
    }

    async createSSETransport(endpoint, res) {
        const transport = new SSEServerTransport(endpoint, res);
        await this.connectTransport(transport);
        return transport;
    }

    async createStdioTransport() {
        const transport = new StdioServerTransport();
        await this.connectTransport(transport);
        return transport;
    }

    async shutdown() {
        await this.server.shutdown();
        this.emit('shutdown');
    }
}

export default MCPService;
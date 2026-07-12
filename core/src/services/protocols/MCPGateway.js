import { Gateway } from '../../Core.js';
import MCPService from './MCPService.js';
import { z } from 'zod';

class MCPGateway extends Gateway {
    constructor(options = {}) {
        super();
        this.options = options;
        this.mcpService = new MCPService({
            commandProcessor: options.commandProcessor
        });
    }

    async initialize() {
        await super.initialize();
        await this.mcpService.initialize();
        
        // Register MCP resources from Serra's resources
        if (this.options.resources) {
            for (const [name, resource] of Object.entries(this.options.resources)) {
                this.registerResource(name, resource);
            }
        }

        // Register MCP tools from Serra's commands
        if (this.options.commands) {
            for (const [name, command] of Object.entries(this.options.commands)) {
                this.registerTool(name, command);
            }
        }

        this.mcpService.on('connected', (transport) => {
            this.emit('mcpTransportConnected', transport);
        });

        this.emit('initialized');
    }

    registerResource(name, resource) {
        // Convert Serra resource to MCP resource
        this.mcpService.server.resource(
            name,
            `serra://${name}`,
            async (uri) => ({
                contents: [{
                    uri: uri.href,
                    text: typeof resource.content === 'function' 
                        ? await resource.content() 
                        : resource.content
                }]
            })
        );
    }

    registerTool(name, command) {
        // Convert Serra command to MCP tool
        const paramSchema = {};
        if (command.params) {
            for (const param of command.params) {
                paramSchema[param.name] = z.any(); // Use appropriate zod schema based on param type
            }
        }

        this.mcpService.server.tool(
            name,
            paramSchema,
            async (args) => {
                try {
                    const result = await command.execute(args);
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
    }

    async createSSEEndpoint(endpoint, res) {
        return this.mcpService.createSSETransport(endpoint, res);
    }

    async createStdioConnection() {
        return this.mcpService.createStdioTransport();
    }

    async shutdown() {
        await this.mcpService.shutdown();
        await super.shutdown();
    }
}

export default MCPGateway;

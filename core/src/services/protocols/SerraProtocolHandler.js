/**
 * Serra protocol handler for the ServiceRegistry.
 * Handles the custom serra:// protocol for inter-core service communication.
 */

import BaseProtocolHandler from './BaseProtocolHandler.js';

class SerraProtocolHandler extends BaseProtocolHandler {
    constructor(options = {}) {
        super();
        this.options = {
            ...options
        };
        this.core = null;
    }

    /**
     * Initialize the Serra protocol handler
     * @param {Object} options - Initialization options
     * @param {Object} options.core - Core instance for inter-core communication
     * @returns {Promise<void>}
     */
    async initialize(options = {}) {
        if (!options.core) {
            throw new Error('Core instance is required for initialization');
        }

        this.core = options.core;
    }

    /**
     * Handle a request for a service
     * @param {Object} service - The service entry
     * @param {string} path - The path within the service
     * @param {Object} request - The request object
     * @returns {Promise<Object>} - The response from the service
     */
    async handleRequest(service, path, request) {
        try {
            // Ensure service supports the serra protocol
            if (!service.options.protocols.includes('serra')) {
                throw new Error(`Service '${service.name}' does not support serra protocol`);
            }

            // Create a dialog for this request if needed
            const dialog = await this.core.createDialog('serra', {
                service: service.name,
                path: path
            });

            // Call the service's handler method
            if (typeof service.service.handleRequest !== 'function') {
                throw new Error(`Service '${service.name}' does not implement handleRequest method`);
            }

            const response = await service.service.handleRequest(path, {
                ...request,
                protocol: 'serra',
                dialog: dialog
            });

            // Close the dialog after the request is handled
            await this.core.closeDialog(dialog);

            return response;
        } catch (error) {
            return {
                status: 500,
                body: {
                    error: error.message
                }
            };
        }
    }

    /**
     * Shutdown the protocol handler
     * @returns {Promise<void>}
     */
    async shutdown() {
        this.core = null;
    }
}

export default SerraProtocolHandler;
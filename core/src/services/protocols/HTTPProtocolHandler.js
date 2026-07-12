/**
 * HTTP protocol handler for the ServiceRegistry.
 * Handles both HTTP and HTTPS protocols for service requests.
 */

import BaseProtocolHandler from './BaseProtocolHandler.js';

class HTTPProtocolHandler extends BaseProtocolHandler {
    constructor(options = {}) {
        super();
        this.options = {
            basePath: '/services',  // Base path for all HTTP services
            ...options
        };
        this.server = null;
    }

    /**
     * Initialize the HTTP protocol handler
     * @param {Object} options - Initialization options
     * @param {Object} options.server - Express or HTTP server instance
     * @returns {Promise<void>}
     */
    async initialize(options = {}) {
        if (!options.server) {
            throw new Error('HTTP server instance is required for initialization');
        }

        this.server = options.server;
        this.setupRoutes();
    }

    /**
     * Set up HTTP routes for registered services
     * @private
     */
    setupRoutes() {
        if (!this.server || !this.server.use) {
            throw new Error('Invalid HTTP server instance');
        }

        // Middleware to handle service requests
        this.server.use(this.options.basePath, async (req, res, next) => {
            try {
                // Extract service name from URL path
                const pathParts = req.path.split('/');
                const serviceName = pathParts[1];
                const servicePath = '/' + pathParts.slice(2).join('/');

                if (!serviceName) {
                    // Return list of available services if no specific service is requested
                    const services = this.getServices().map(service => ({
                        name: service.name,
                        path: service.options.path,
                        protocols: service.options.protocols,
                        metadata: service.options.metadata
                    }));
                    return res.json({ services });
                }

                const service = this.getService(serviceName);
                if (!service) {
                    return res.status(404).json({
                        error: `Service '${serviceName}' not found`
                    });
                }

                // Create request object from HTTP request
                const request = {
                    method: req.method,
                    path: servicePath,
                    headers: req.headers,
                    query: req.query,
                    body: req.body,
                    protocol: req.protocol
                };

                // Handle the request
                const response = await this.handleRequest(service, servicePath, request);

                // Send response
                if (response.headers) {
                    Object.entries(response.headers).forEach(([key, value]) => {
                        res.setHeader(key, value);
                    });
                }
                res.status(response.status || 200).send(response.body);
            } catch (error) {
                next(error);
            }
        });
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
            // Ensure service supports the requested protocol
            if (!service.options.protocols.includes(request.protocol)) {
                throw new Error(`Service '${service.name}' does not support ${request.protocol} protocol`);
            }

            // Call the service's handler method
            if (typeof service.service.handleRequest !== 'function') {
                throw new Error(`Service '${service.name}' does not implement handleRequest method`);
            }

            return await service.service.handleRequest(path, request);
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
        // No specific shutdown needed for HTTP handler
        this.server = null;
    }
}

export default HTTPProtocolHandler;
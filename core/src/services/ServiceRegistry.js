/**
 * ServiceRegistry class for managing services that can be exposed through gateways.
 * This class provides functionality to register, discover, and access services
 * through various protocols including HTTP, HTTPS, and the custom serra:// protocol.
 */

import { EventEmitter } from 'events';

class ServiceRegistry extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
        this.protocols = new Map();
    }

    /**
     * Register a new service with the registry
     * @param {string} name - The unique name of the service
     * @param {Object} service - The service implementation
     * @param {Object} options - Service registration options
     * @param {Array<string>} options.protocols - Protocols this service supports ['http', 'https', 'serra']
     * @param {string} options.path - The path where the service will be exposed
     * @param {Object} options.metadata - Additional metadata about the service
     * @returns {boolean} - Success status of registration
     */
    registerService(name, service, options = {}) {
        if (this.services.has(name)) {
            throw new Error(`Service '${name}' is already registered`);
        }

        const serviceEntry = {
            name,
            service,
            options: {
                protocols: ['http'],  // Default protocol
                path: `/${name}`,    // Default path
                metadata: {},
                ...options
            },
            status: 'registered'
        };

        this.services.set(name, serviceEntry);
        
        // Register with each protocol handler
        serviceEntry.options.protocols.forEach(protocol => {
            if (this.protocols.has(protocol)) {
                const protocolHandler = this.protocols.get(protocol);
                protocolHandler.registerService(name, serviceEntry);
            }
        });

        this.emit('serviceRegistered', serviceEntry);
        return true;
    }

    /**
     * Unregister a service from the registry
     * @param {string} name - The name of the service to unregister
     * @returns {boolean} - Success status of unregistration
     */
    unregisterService(name) {
        const serviceEntry = this.services.get(name);
        if (!serviceEntry) {
            return false;
        }

        // Unregister from each protocol handler
        serviceEntry.options.protocols.forEach(protocol => {
            if (this.protocols.has(protocol)) {
                const protocolHandler = this.protocols.get(protocol);
                protocolHandler.unregisterService(name);
            }
        });

        this.services.delete(name);
        this.emit('serviceUnregistered', name);
        return true;
    }

    /**
     * Register a protocol handler
     * @param {string} protocol - The protocol identifier (e.g., 'http', 'https', 'serra')
     * @param {Object} handler - The protocol handler implementation
     * @returns {boolean} - Success status of registration
     */
    registerProtocol(protocol, handler) {
        if (this.protocols.has(protocol)) {
            throw new Error(`Protocol '${protocol}' is already registered`);
        }

        this.protocols.set(protocol, handler);
        
        // Register existing services with this new protocol handler
        this.services.forEach((serviceEntry, name) => {
            if (serviceEntry.options.protocols.includes(protocol)) {
                handler.registerService(name, serviceEntry);
            }
        });

        this.emit('protocolRegistered', protocol);
        return true;
    }

    /**
     * Unregister a protocol handler
     * @param {string} protocol - The protocol identifier to unregister
     * @returns {boolean} - Success status of unregistration
     */
    unregisterProtocol(protocol) {
        if (!this.protocols.has(protocol)) {
            return false;
        }

        this.protocols.delete(protocol);
        this.emit('protocolUnregistered', protocol);
        return true;
    }

    /**
     * Get a service by name
     * @param {string} name - The name of the service to retrieve
     * @returns {Object|null} - The service entry or null if not found
     */
    getService(name) {
        return this.services.get(name) || null;
    }

    /**
     * Get all registered services
     * @param {string} [protocol] - Optional protocol filter
     * @returns {Array} - Array of service entries
     */
    getServices(protocol) {
        if (protocol) {
            return Array.from(this.services.values())
                .filter(service => service.options.protocols.includes(protocol));
        }
        return Array.from(this.services.values());
    }

    /**
     * Get all registered protocols
     * @returns {Array<string>} - Array of protocol identifiers
     */
    getProtocols() {
        return Array.from(this.protocols.keys());
    }

    /**
     * Parse a service URI and return the corresponding service
     * @param {string} uri - The service URI (e.g., 'serra://service-name/path')
     * @returns {Object} - Object containing protocol, service name, and path
     */
    parseServiceURI(uri) {
        try {
            const url = new URL(uri);
            const protocol = url.protocol.replace(':', '');
            const servicePath = url.pathname.split('/');
            const serviceName = servicePath[1]; // First part of the path is the service name
            const path = '/' + servicePath.slice(2).join('/');
            
            return {
                protocol,
                serviceName,
                path,
                query: url.searchParams
            };
        } catch (error) {
            throw new Error(`Invalid service URI: ${uri}`);
        }
    }

    /**
     * Route a request to the appropriate service
     * @param {string} protocol - The protocol of the request
     * @param {string} serviceName - The name of the service
     * @param {string} path - The path within the service
     * @param {Object} request - The request object
     * @returns {Promise<Object>} - The response from the service
     */
    async routeRequest(protocol, serviceName, path, request) {
        const service = this.getService(serviceName);
        if (!service) {
            throw new Error(`Service '${serviceName}' not found`);
        }

        if (!service.options.protocols.includes(protocol)) {
            throw new Error(`Service '${serviceName}' does not support protocol '${protocol}'`);
        }

        const protocolHandler = this.protocols.get(protocol);
        if (!protocolHandler) {
            throw new Error(`Protocol '${protocol}' not supported`);
        }

        return protocolHandler.handleRequest(service, path, request);
    }
}

// Create a singleton instance
const serviceRegistry = new ServiceRegistry();

export { ServiceRegistry };
export default serviceRegistry;
/**
 * Base class for protocol handlers that can be registered with the ServiceRegistry.
 * This class defines the interface that all protocol handlers must implement.
 */

import { EventEmitter } from 'events';

class BaseProtocolHandler extends EventEmitter {
    constructor() {
        super();
        this.services = new Map();
    }

    /**
     * Register a service with this protocol handler
     * @param {string} name - The name of the service
     * @param {Object} serviceEntry - The service entry from the registry
     * @returns {boolean} - Success status of registration
     */
    registerService(name, serviceEntry) {
        if (this.services.has(name)) {
            throw new Error(`Service '${name}' is already registered with this protocol`);
        }

        this.services.set(name, serviceEntry);
        this.emit('serviceRegistered', serviceEntry);
        return true;
    }

    /**
     * Unregister a service from this protocol handler
     * @param {string} name - The name of the service to unregister
     * @returns {boolean} - Success status of unregistration
     */
    unregisterService(name) {
        if (!this.services.has(name)) {
            return false;
        }

        const serviceEntry = this.services.get(name);
        this.services.delete(name);
        this.emit('serviceUnregistered', serviceEntry);
        return true;
    }

    /**
     * Get a service by name
     * @param {string} name - The name of the service
     * @returns {Object|null} - The service entry or null if not found
     */
    getService(name) {
        return this.services.get(name) || null;
    }

    /**
     * Get all registered services
     * @returns {Array} - Array of service entries
     */
    getServices() {
        return Array.from(this.services.values());
    }

    /**
     * Handle a request for a service
     * @param {Object} service - The service entry
     * @param {string} path - The path within the service
     * @param {Object} request - The request object
     * @returns {Promise<Object>} - The response from the service
     */
    async handleRequest(service, path, request) {
        throw new Error('BaseProtocolHandler.handleRequest() must be implemented by subclass');
    }

    /**
     * Initialize the protocol handler
     * @param {Object} options - Initialization options
     * @returns {Promise<void>}
     */
    async initialize(options = {}) {
        throw new Error('BaseProtocolHandler.initialize() must be implemented by subclass');
    }

    /**
     * Shutdown the protocol handler
     * @returns {Promise<void>}
     */
    async shutdown() {
        throw new Error('BaseProtocolHandler.shutdown() must be implemented by subclass');
    }
}

export default BaseProtocolHandler;
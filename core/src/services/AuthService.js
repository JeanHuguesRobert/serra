import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Base authentication service that provides a common interface
 * Platform-agnostic implementation that can be extended for specific environments
 */
export class AuthService extends EventEmitter {
    constructor() {
        super();
        this.authenticated = false;
        this.user = null;
        this.token = null;
    }

    /**
     * Check if the user is authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
        return this.authenticated;
    }

    /**
     * Get the current user
     * @returns {Object|null} - User object or null if not authenticated
     */
    getUser() {
        return this.user;
    }

    /**
     * Get the authentication token
     * @returns {string|null} - Token or null if not authenticated
     */
    getToken() {
        return this.token;
    }

    /**
     * Initialize the authentication service
     * @param {Object} options - Initialization options
     * @returns {Promise} - Resolves when initialized
     */
    async initialize(options = {}) {
        throw new Error('initialize method must be implemented by concrete classes');
    }

    /**
     * Start the login process
     * @param {Object} credentials - Login credentials
     * @returns {Promise} - Resolves when login process is started
     */
    async login(credentials) {
        throw new Error('login method must be implemented by concrete classes');
    }

    /**
     * Handle authentication callback
     * @param {Object} params - Callback parameters
     * @returns {Promise<boolean>} - Resolves with authentication success
     */
    async handleCallback(params) {
        throw new Error('handleCallback method must be implemented by concrete classes');
    }

    /**
     * Log out the current user
     * @returns {Promise} - Resolves when logged out
     */
    async logout() {
        this.authenticated = false;
        this.user = null;
        this.token = null;
        this.emit('authChange', { authenticated: false });
    }

    /**
     * Set authentication state
     * @param {Object} authState - Authentication state
     * @private
     */
    _setAuthState(authState) {
        this.authenticated = authState.authenticated || false;
        this.user = authState.user || null;
        this.token = authState.token || null;
        this.emit('authChange', { authenticated: this.authenticated, user: this.user });
    }
}

/**
 * GitHub authentication provider
 */
export class GitHubAuthProvider {
    constructor(options = {}) {
        this.clientId = options.clientId;
        this.redirectUri = options.redirectUri;
        this.scope = options.scope || 'repo';
    }

    /**
     * Get the authorization URL
     * @returns {string} - Authorization URL
     */
    getAuthorizationUrl() {
        return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${this.scope}`;
    }

    /**
     * Exchange code for token
     * @param {string} code - Authorization code
     * @param {Function} tokenExchange - Function to exchange code for token
     * @returns {Promise<Object>} - Token response
     */
    async exchangeCodeForToken(code, tokenExchange) {
        if (!tokenExchange) {
            throw new Error('Token exchange function is required');
        }
        return tokenExchange(code);
    }
}

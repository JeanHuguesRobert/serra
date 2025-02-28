import { AIService, CopilotProvider, TextSynthProvider } from '@serra/core';
import githubService from './githubService';
import connectionStatus from './ConnectionStatusService';

class BrowserAIService extends AIService {
    constructor() {
        super();
        this.providers = {
            copilot: new CopilotProvider(),
            textsynth: new TextSynthProvider()
        };
        this.serverProvider = null;
        this.localProvider = null;

        // Subscribe to connection status changes
        connectionStatus.onStatusChange(this.handleConnectionChange.bind(this));
    }

    async initialize() {
        // Try to load saved provider configuration from GitHub
        const config = await githubService.getConfig('ai');
        if (config) {
            if (config.serverProvider) {
                this.serverProvider = this.providers[config.serverProvider];
                await this.serverProvider.initialize(config.serverApiKey);
            }
            if (config.localProvider) {
                this.localProvider = this.providers[config.localProvider];
                await this.localProvider.initialize(config.localApiKey);
            }
        }
        
        // Set initial provider based on connection status
        this.handleConnectionChange(connectionStatus.getConnectionState());
    }

    handleConnectionChange(state) {
        if (state.isConnected && this.serverProvider) {
            this.currentProvider = this.serverProvider;
        } else if (this.localProvider) {
            this.currentProvider = this.localProvider;
        }
    }

    async setServerProvider(providerName, apiKey) {
        if (!this.providers[providerName]) {
            throw new Error(`Unknown AI provider: ${providerName}`);
        }

        const provider = this.providers[providerName];
        await provider.initialize(apiKey);
        this.serverProvider = provider;

        // Update current provider if connected
        if (connectionStatus.getConnectionState().isConnected) {
            this.currentProvider = this.serverProvider;
        }

        // Save configuration
        await this.saveConfig();
    }

    async setLocalProvider(providerName, apiKey) {
        if (!this.providers[providerName]) {
            throw new Error(`Unknown AI provider: ${providerName}`);
        }

        const provider = this.providers[providerName];
        await provider.initialize(apiKey);
        this.localProvider = provider;

        // Update current provider if disconnected
        if (!connectionStatus.getConnectionState().isConnected) {
            this.currentProvider = this.localProvider;
        }

        // Save configuration
        await this.saveConfig();
    }

    async saveConfig() {
        await githubService.saveConfig('ai', {
            serverProvider: this.serverProvider?.constructor.name.toLowerCase(),
            serverApiKey: this.serverProvider?.apiKey,
            localProvider: this.localProvider?.constructor.name.toLowerCase(),
            localApiKey: this.localProvider?.apiKey
        });
    }

    async processIntent(text, context = {}) {
        // Client-specific intent processing
        // This could involve UI-specific actions
        return {
            text: await this.generateText(text),
            actions: this.generateActions(text, context)
        };
    }

    generateActions(text, context) {
        // Generate UI actions based on text and context
        const actions = [];
        
        // Simple example logic
        if (text.toLowerCase().includes('dashboard')) {
            actions.push({ command: '/dash', icon: 'dashboard', label: 'Open Dashboard' });
        }
        
        if (text.toLowerCase().includes('settings')) {
            actions.push({ command: '/settings', icon: 'settings', label: 'Open Settings' });
        }
        
        return actions;
    }
}

export default new BrowserAIService();
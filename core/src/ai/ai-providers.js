/**
 * AI Provider Management System
 * Handles configuration, status checking, and switching between different AI providers
 */

export class AIProviderManager {
  constructor() {
    this.providers = new Map();
    this.currentProvider = process.env.DEFAULT_AI_PROVIDER || 'github';
    this.timeout = parseInt(process.env.AI_PROVIDER_TIMEOUT, 10) || 30000;
    this.logs = [];

    // Initialize default providers if environment variables are available
    if (process.env.GITHUB_API_KEY) {
      this.configureProvider('github', {
        apiKey: process.env.GITHUB_API_KEY,
        model: 'gpt-4',
        capabilities: ['code-generation', 'code-review'],
        quotaRemaining: 1000,
        options: {}
      });
    }

    if (process.env.SYNTHTEXT_API_KEY) {
      this.configureProvider('synthtext', {
        apiKey: process.env.SYNTHTEXT_API_KEY,
        capabilities: ['text-generation', 'translation'],
        quotaRemaining: 500,
        options: {}
      });
    }
  }

  /**
   * Configure an AI provider
   * @param {string} provider - Provider name ('github' or 'synthtext')
   * @param {Object} config - Provider configuration
   */
  async configureProvider(provider, config) {
    this.providers.set(provider, {
      name: provider,
      config,
      status: provider === this.currentProvider ? 'active' : 'configured',
      lastCheck: new Date().toISOString(),
      capabilities: config.capabilities || [],
      quotaRemaining: config.quotaRemaining || 0
    });
  }

  /**
   * Get the status of all configured providers
   * @returns {Object} Status of all providers
   */
  getProvidersStatus() {
    const providers = [];
    for (const [name, provider] of this.providers) {
      providers.push({
        name,
        status: provider.status,
        lastCheck: provider.lastCheck,
        capabilities: provider.capabilities,
        quotaRemaining: provider.quotaRemaining
      });
    }
    return { providers };
  }

  /**
   * Switch to a different AI provider
   * @param {string} provider - Provider to switch to
   * @param {string} reason - Reason for switching
   * @returns {Object} Result of the switch operation
   */
  async switchProvider(provider, reason) {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not configured`);
    }

    const previousProvider = this.currentProvider;
    this.currentProvider = provider;

    // Update provider statuses
    for (const [name, providerData] of this.providers) {
      providerData.status = name === provider ? 'active' : 'configured';
      this.providers.set(name, providerData);
    }

    // Log the switch
    this.logProviderAction(provider, 'switch', 'success', 
      `Switched from ${previousProvider} to ${provider} due to ${reason}`);

    return { success: true, provider };
  }

  /**
   * Get the current active provider
   * @returns {Object} Current provider configuration
   */
  getCurrentProvider() {
    return this.providers.get(this.currentProvider);
  }

  /**
   * Log provider-related events
   * @param {string} provider - Provider name
   * @param {string} action - Action performed
   * @param {string} status - Status of the action
   * @param {string} details - Additional details
   */
  logProviderAction(provider, action, status, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      provider,
      action,
      status,
      details
    };
    this.logs.push(logEntry);
    console.log('[AI Provider]', logEntry);
  }

  /**
   * Get provider logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Update provider quota and status
   * @param {string} provider - Provider name
   * @param {number} quotaRemaining - Remaining quota
   */
  updateProviderQuota(provider, quotaRemaining) {
    const providerData = this.providers.get(provider);
    if (providerData) {
      providerData.quotaRemaining = quotaRemaining;
      providerData.lastCheck = new Date().toISOString();
      this.providers.set(provider, providerData);
    }
  }
}
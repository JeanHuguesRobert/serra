/**
 * Base interface for AI providers
 */
class AIProvider {
    /**
     * Initialize the AI provider with configuration
     * @param {Object} config Provider-specific configuration
     */
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Generate a completion for the given prompt
     * @param {string} prompt The input prompt
     * @param {Object} options Additional generation options
     * @returns {Promise<string>} The generated completion
     */
    async complete(prompt, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Generate code completion for the given context
     * @param {string} context The code context
     * @param {Object} options Additional generation options
     * @returns {Promise<string>} The generated code completion
     */
    async completeCode(context, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Generate suggestions for code improvements
     * @param {string} code The code to analyze
     * @param {Object} options Additional analysis options
     * @returns {Promise<Array<Object>>} Array of suggestions
     */
    async suggestImprovements(code, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Validate provider configuration
     * @returns {boolean} True if configuration is valid
     */
    validateConfig() {
        return true;
    }
}

module.exports = AIProvider;
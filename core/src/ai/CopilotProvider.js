const AIProvider = require('./AIProvider');

class CopilotProvider extends AIProvider {
    constructor(config = {}) {
        super(config);
        this.apiKey = config.apiKey;
        this.apiEndpoint = config.apiEndpoint || 'https://api.github.com/copilot';
    }

    validateConfig() {
        return Boolean(this.apiKey);
    }

    async complete(prompt, options = {}) {
        if (!this.validateConfig()) {
            throw new Error('GitHub Copilot API key not configured');
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                    max_tokens: options.maxTokens || 100,
                    temperature: options.temperature || 0.7,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`GitHub Copilot API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].text;
        } catch (error) {
            throw new Error(`Failed to generate completion: ${error.message}`);
        }
    }

    async completeCode(context, options = {}) {
        return this.complete(context, {
            ...options,
            temperature: options.temperature || 0.3,
            stop: options.stop || ['```']
        });
    }

    async suggestImprovements(code, options = {}) {
        const prompt = `Analyze this code and suggest improvements:

${code}

Suggestions:`;
        
        const response = await this.complete(prompt, {
            ...options,
            temperature: options.temperature || 0.2,
            max_tokens: options.maxTokens || 500
        });

        // Parse suggestions into structured format
        const suggestions = response
            .split('\n')
            .filter(line => line.trim())
            .map(suggestion => ({
                type: 'improvement',
                description: suggestion.replace(/^[\d\.\-\*]\s*/, '')
            }));

        return suggestions;
    }
}

module.exports = CopilotProvider;
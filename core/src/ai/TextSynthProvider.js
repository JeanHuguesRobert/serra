const AIProvider = require('./AIProvider');

class TextSynthProvider extends AIProvider {
    constructor(config = {}) {
        super(config);
        this.apiKey = config.apiKey;
        this.apiEndpoint = config.apiEndpoint || 'https://api.textsynth.com/v1';
    }

    validateConfig() {
        return Boolean(this.apiKey);
    }

    async complete(prompt, options = {}) {
        if (!this.validateConfig()) {
            throw new Error('TextSynth API key not configured');
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/engines/gpt_3_5_turbo/completions`, {
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
                throw new Error(`TextSynth API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.text;
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
        const prompt = `Please analyze this code and suggest improvements:\n\n${code}`;
        const completion = await this.complete(prompt, {
            ...options,
            temperature: 0.3,
            max_tokens: 500
        });

        // Parse the completion into structured suggestions
        const suggestions = completion
            .split('\n')
            .filter(line => line.trim())
            .map(suggestion => ({
                type: 'improvement',
                description: suggestion
            }));

        return suggestions;
    }
}

module.exports = TextSynthProvider;
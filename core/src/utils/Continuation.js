/**
 * Represents a continuation that can be used to manage asynchronous execution flow
 * and maintain execution context across different parts of the application.
 */
export class Continuation {
    constructor(options = {}) {
        this.callback = options.callback;
        this.continuationCode = options.continuationCode;
        this.context = options.context || {};
    }

    static fromCallback(callback) {
        return new Continuation({ callback });
    }

    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (typeof data.continuation !== 'string') {
                throw new Error('Invalid continuation format: missing continuation code');
            }
            return new Continuation({
                continuationCode: data.continuation,
                context: data.context || {}
            });
        } catch (error) {
            throw new Error(`Failed to parse continuation JSON: ${error.message}`);
        }
    }

    async execute(result, error) {
        try {
            if (this.callback) {
                // Handle traditional callback style
                return await this.callback(result, error);
            } else if (this.continuationCode) {
                // Handle JSON-based continuation with executable code
                const contextVars = Object.entries(this.context)
                    .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
                    .join('\n');
                
                const code = `
                    ${contextVars}
                    const result = ${JSON.stringify(result)};
                    const error = ${JSON.stringify(error)};
                    ${this.continuationCode}
                `;
                
                return await eval(code);
            }
        } catch (executionError) {
            throw new Error(`Continuation execution failed: ${executionError.message}`);
        }
    }

    withContext(additionalContext) {
        return new Continuation({
            callback: this.callback,
            continuationCode: this.continuationCode,
            context: { ...this.context, ...additionalContext }
        });
    }
}
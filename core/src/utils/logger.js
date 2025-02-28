/**
 * Create a logger with a specific prefix
 * Works in both browser and Node.js environments
 * 
 * @param {string} prefix - Prefix for log messages
 * @returns {object} - Logger object with log, warn, error, and debug methods
 */
export const createLogger = (prefix) => ({
  log: (...args) => console.log(`[${prefix}]`, ...args),
  warn: (...args) => console.warn(`[${prefix}]`, ...args),
  error: (...args) => console.error(`[${prefix}]`, ...args),
  debug: (...args) => console.debug(`[${prefix}]`, ...args)
});

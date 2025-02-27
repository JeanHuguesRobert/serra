export const createLogger = (prefix) => ({
  log: (...args) => console.log(`[${prefix}]`, ...args),
  warn: (...args) => console.warn(`[${prefix}]`, ...args),
  error: (...args) => console.error(`[${prefix}]`, ...args),
  debug: (...args) => console.debug(`[${prefix}]`, ...args)
});

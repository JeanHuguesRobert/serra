export const LoggerMixin = (prefix = '') => ({
  log(...args) {
    if (this.debug) {
      console.log(`[${prefix} ${new Date().toISOString()}]`, ...args);
    }
  },

  warn(...args) {
    if (this.debug) {
      console.warn(`[${prefix} ${new Date().toISOString()}]`, ...args);
    }
  },

  error(...args) {
    if (this.debug) {
      console.error(`[${prefix} ${new Date().toISOString()}]`, ...args);
    }
  }
});

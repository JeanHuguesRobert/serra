
// Deprecaded: Use denbug.js instead
// 
export const createLogger = (prefix) => {
  const getTimestamp = () => new Date().toISOString();
  const formatMessage = (level, args) => `[${getTimestamp()}] [${prefix}] [${level}] ${args.join(' ')}`;

  return {
    log: (...args) => console.log(formatMessage('INFO', args)),
    info: (...args) => console.log(formatMessage('INFO', args)),
    warn: (...args) => console.warn(formatMessage('WARN', args)),
    error: (...args) => console.error(formatMessage('ERROR', args)),
    debug: (...args) => console.debug(formatMessage('DEBUG', args))
  };
};

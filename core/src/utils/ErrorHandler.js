export class ErrorHandler {
  static handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof Error) {
      return {
        type: 'ERROR',
        message: error.message,
        context: context,
        timestamp: Date.now()
      };
    }
    
    return {
      type: 'ERROR',
      message: String(error),
      context: context,
      timestamp: Date.now()
    };
  }
}
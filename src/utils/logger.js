const DEBUG = process.env.NODE_ENV === 'development';

export const log = {
  info: (message, data = null) => {
    if (DEBUG) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  
  error: (message, error = null) => {
    if (DEBUG) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },
  
  debug: (message, data = null) => {
    if (DEBUG) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
};
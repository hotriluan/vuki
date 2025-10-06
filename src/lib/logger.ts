// Simple logger implementation to avoid dependency issues
const createLogger = () => {
  const level = process.env.LOG_LEVEL || 'info';
  const isProd = process.env.NODE_ENV === 'production';
  
  return {
    info: (msg: any, ...args: any[]) => console.log('[INFO]', msg, ...args),
    warn: (msg: any, ...args: any[]) => console.warn('[WARN]', msg, ...args),
    error: (msg: any, ...args: any[]) => console.error('[ERROR]', msg, ...args),
    debug: (msg: any, ...args: any[]) => {
      if (!isProd) console.log('[DEBUG]', msg, ...args);
    },
    child: (bindings: Record<string, any>) => createLogger()
  };
};

// Single logger instance. In production use pretty disabled; in dev optionally pretty-print via pino-pretty.
export const logger = createLogger();

export function childLogger(bindings: Record<string, any>) {
  return logger.child(bindings);
}

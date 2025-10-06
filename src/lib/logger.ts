// Dynamic import to avoid type issues if TS can't resolve module types immediately
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pino = require('pino');

// Single logger instance. In production use pretty disabled; in dev optionally pretty-print via pino-pretty.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' }
  } : undefined
});

export function childLogger(bindings: Record<string, any>) {
  return logger.child(bindings);
}

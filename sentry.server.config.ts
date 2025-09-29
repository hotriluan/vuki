// Skeleton Sentry server init.
import { features } from './src/config/features';

export function initSentryServer() {
  if (!features.enableSentry) return;
  try {
    // Optional: dynamic import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1
    });
  } catch {}
}

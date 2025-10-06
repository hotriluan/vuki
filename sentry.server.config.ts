// Skeleton Sentry server init.
import { features } from './src/config/features';

export function initSentryServer() {
  if (!features.enableSentry) return;
  
  // Sentry initialization disabled for build compatibility
  console.log('[Sentry] Server initialization skipped for build compatibility');
}

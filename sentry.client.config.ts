// Skeleton Sentry client init – chỉ kích hoạt khi enableSentry flag.
// Cài đặt gói @sentry/nextjs nếu muốn bật thực tế.
import { features } from './src/config/features';

export function initSentryClient() {
  if (!features.enableSentry) return;
  // Dynamic import để tránh bundle nếu tắt
  import('@sentry/nextjs').then(Sentry => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      integrations: [],
    });
  }).catch(() => {});
}

// Client side Web Vitals instrumentation
// Được import động trong layout để không ảnh hưởng SSR.

// Dùng API chính (v9+) – nếu attribution cần sau này có thể chuyển sang '/attribution'.
import { onCLS, onFID, onLCP, onINP, onTTFB, type Metric } from 'web-vitals';
import { isEnabled } from '@/config/features';

interface MetricPayload {
  metric: string;
  value: number;
  id?: string;
  label?: string;
  navigationType?: string;
}

function send(metric: MetricPayload) {
  try {
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true
    });
  } catch {}
}

export function initWebVitals() {
  if (!isEnabled('enableWebVitals')) return;
  // Chỉ chạy trên client
  if (typeof window === 'undefined') return;
  const wrap = (name: string) => (m: Metric & { rating?: string }) => {
    send({ metric: name, value: m.value, id: m.id, label: (m as any).rating });
  };
  onCLS(wrap('CLS'));
  onLCP(wrap('LCP'));
  onFID(wrap('FID'));
  onINP(wrap('INP'));
  onTTFB((m) => send({ metric: 'TTFB', value: m.value, id: m.id }));
}

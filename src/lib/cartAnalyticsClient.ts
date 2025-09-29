// Lắng nghe sự kiện cart:updated và gửi về analytics mock endpoint.
import { eventBus } from './eventBus';

let attached = false;
export function initCartAnalytics() {
  if (attached) return;
  attached = true;
  if (typeof window === 'undefined') return;
  eventBus.on('cart:updated', (p) => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'cart', value: p.total, items: p.totalItems }),
        keepalive: true
      });
    } catch {}
  });
}

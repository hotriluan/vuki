// Event bus nhỏ có typing cơ bản.

type CartUpdatedPayload = { totalItems: number; subtotal: number; discount: number; total: number };

interface EventsMap {
  'cart:updated': CartUpdatedPayload;
}

type Handler<K extends keyof EventsMap> = (data: EventsMap[K]) => void;

class EventBus {
  private listeners: Record<string, Set<(...args: any[]) => void>> = {};

  on<K extends keyof EventsMap>(event: K, handler: Handler<K>) {
    (this.listeners[event as string] ||= new Set()).add(handler as any);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventsMap>(event: K, handler: Handler<K>) {
    this.listeners[event as string]?.delete(handler as any);
  }

  emit<K extends keyof EventsMap>(event: K, payload: EventsMap[K]) {
    this.listeners[event as string]?.forEach(h => {
      try { h(payload); } catch {}
    });
  }
}

export const eventBus = new EventBus();

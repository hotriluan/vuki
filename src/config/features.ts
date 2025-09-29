// Feature flags đơn giản.
// Có thể mở rộng: đọc từ env, remote config, hoặc cookie/ header để A/B.

export interface FeatureFlags {
  enableRecentlyViewed: boolean;
  enableRelatedProducts: boolean;
  enableProductReviews: boolean;
  enableSentry: boolean;
  enableWebVitals: boolean;
}

// Flags mặc định – có thể override bằng biến môi trường ở build time.
export const features: FeatureFlags = {
  enableRecentlyViewed: process.env.NEXT_PUBLIC_FF_RECENTLY_VIEWED !== '0',
  enableRelatedProducts: process.env.NEXT_PUBLIC_FF_RELATED !== '0',
  enableProductReviews: process.env.NEXT_PUBLIC_FF_REVIEWS !== '0',
  enableSentry: process.env.NEXT_PUBLIC_FF_SENTRY === '1', // tắt mặc định
  enableWebVitals: process.env.NEXT_PUBLIC_FF_WEB_VITALS !== '0'
};

export function isEnabled<K extends keyof FeatureFlags>(k: K): boolean {
  return !!features[k];
}

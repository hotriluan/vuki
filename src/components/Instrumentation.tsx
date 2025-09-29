"use client";
import { useEffect } from 'react';
import { initWebVitals } from '@/lib/webVitalsClient';
import { initCartAnalytics } from '@/lib/cartAnalyticsClient';
import { features } from '@/config/features';

export function Instrumentation() {
  useEffect(() => {
    if (features.enableWebVitals) initWebVitals();
    initCartAnalytics();
  }, []);
  return null;
}

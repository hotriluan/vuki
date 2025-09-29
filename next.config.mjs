import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Cho phép phân tích bundle khi đặt ANALYZE=1
const withAnalyzer = process.env.ANALYZE ? require('@next/bundle-analyzer')({ enabled: true }) : (cfg => cfg);

/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
};

export default withAnalyzer(baseConfig);

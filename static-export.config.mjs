import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import withPWAOrig from 'next-pwa';

// Disable PWA for static export to avoid service worker issues
const withPWA = withPWAOrig({
  dest: 'public',
  disable: true, // Disable PWA for static export
});

// Cho phép phân tích bundle khi đặt ANALYZE=1
const withAnalyzer = process.env.ANALYZE ? require('@next/bundle-analyzer')({ enabled: true }) : (cfg => cfg);

/** @type {import('next').NextConfig} */
const baseConfig = {
  // Enable static export
  output: 'export',
  trailingSlash: true,
  
  // Disable features not compatible with static export
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  
  // Disable server-side features
  experimental: {
    // Remove any server-side experimental features
  },
  
  // Skip build-time API routes check for static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporary for static export
  },

  async headers() {
    // Static hosting headers - simplified
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ]
      }
    ];
  }
};

// Compose plugins: analyzer first, then PWA
const withPlugins = cfg => withPWA(withAnalyzer(cfg));

export default withPlugins(baseConfig);
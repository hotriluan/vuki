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
  },
  async headers() {
    // NOTE: Nếu deploy trên Vercel, các header này sẽ được áp dụng edge.
    // CSP ở đây cố tình chặt: không cho inline script ngoại trừ Next.js self hashed.
    // Nếu sau này cần analytics bên thứ 3 => cập nhật whitelist (script-src/img-src/connect-src).
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Next.js nội bộ thêm inline script cho hydration -> dùng 'unsafe-inline' tạm thời hoặc chuyển sang nonce/hashes khi triển khai server custom.
      // Ở giai đoạn sớm ta chấp nhận 'unsafe-inline' để không phá app; ghi chú nâng cấp về nonce.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://images.unsplash.com data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-DNS-Prefetch-Control', value: 'off' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
        ]
      }
    ];
  }
};

export default withAnalyzer(baseConfig);

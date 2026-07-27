import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true, // Ép Next.js luôn nén nội dung (Gzip/Brotli)
  outputFileTracingRoot: path.resolve(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: false,
    optimizeCss: true, // Inlines critical CSS to avoid render-blocking
    optimizePackageImports: ['lucide-react', 'react-icons'], // Loại bỏ JS thừa từ các thư viện icon
    serverActions: {
      allowedOrigins: [
        'ecdc.vnos.org',
        'localhost:3000',
        '127.0.0.1:3000',
      ],
    },
  },
  // FIX Phase 2: Cho phép next/image tối ưu ảnh từ domain nội bộ và YouTube
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'ecdc.vnos.org',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
    ],
    // Tự động convert sang WebP/AVIF khi browser hỗ trợ
    formats: ['image/avif', 'image/webp'],
    // Cache ảnh đã optimize trong 7 ngày
    minimumCacheTTL: 604800,
    // Các kích thước ảnh responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 70, 75, 80, 90, 100],
  },
  async redirects() {
    return [
      {
        source: '/admin/globals/settings',
        destination: '/admin/globals/site-settings',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/media/file/:path*',
        has: [
          {
            type: 'header',
            key: 'user-agent',
            value: '(?i).*zalo.*',
          },
        ],
        destination: '/api/miniapp-image?path=/api/media/file/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/media/file/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withSerwist(withPayload(nextConfig));


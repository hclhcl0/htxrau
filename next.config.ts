import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';

// Tự động build danh sách domain từ biến môi trường
// Chỉ cần đổi NEXT_PUBLIC_SERVER_URL trên Coolify, không cần sửa code
function buildAllowedHosts(): string[] {
  const hosts = new Set<string>(['localhost', '127.0.0.1']);
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverURL) {
    try {
      hosts.add(new URL(serverURL).hostname);
    } catch {}
  }
  const extra = process.env.EXTRA_ALLOWED_ORIGINS || '';
  extra.split(',').map(o => o.trim()).filter(Boolean).forEach(o => {
    try { hosts.add(new URL(o).hostname); } catch {}
  });
  return Array.from(hosts);
}

const allowedHosts = buildAllowedHosts();

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  compress: true,
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: [
    'sharp',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: false,
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
    serverActions: {
      // Tự động cho phép tất cả domain từ env — không cần sửa code khi đổi domain
      allowedOrigins: [
        ...allowedHosts,
        'localhost:3000',
        '127.0.0.1:3000',
      ],
    },
  },
  images: {
    remotePatterns: [
      // YouTube thumbnails
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      // Cho phép tất cả domain HTTPS (bao gồm S3/MinIO nội bộ và mọi domain đổi sau này)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      // Cho phép HTTP nội bộ (localhost, MinIO nội bộ Coolify)
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 70, 75, 80, 90, 100],
  },
  async rewrites() {
    return [];
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
};

export default withPayload(nextConfig);

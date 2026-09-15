// Allow self-signed / cloud intermediate TLS certificates (Supabase, RDS, Neon poolers) during build & SSR
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';

// Tự động build danh sách domain từ biến môi trường
// Chỉ cần đổi NEXT_PUBLIC_SERVER_URL trên Coolify/Vercel, không cần sửa code
function buildAllowedHosts(): string[] {
  const hosts = new Set<string>(['localhost', '127.0.0.1']);
  
  const addHostVariants = (hostOrUrl: string) => {
    try {
      const hostname = hostOrUrl.includes('://') ? new URL(hostOrUrl).hostname : hostOrUrl;
      if (!hostname) return;
      hosts.add(hostname);
      if (hostname.startsWith('www.')) {
        hosts.add(hostname.slice(4));
      } else if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        hosts.add(`www.${hostname}`);
      }
    } catch {}
  };

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverURL) addHostVariants(serverURL);

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) addHostVariants(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (process.env.VERCEL_URL) addHostVariants(process.env.VERCEL_URL);

  const extra = process.env.EXTRA_ALLOWED_ORIGINS || '';
  extra.split(',').map(o => o.trim()).filter(Boolean).forEach(o => addHostVariants(o));

  // Thêm cứng domain HTX để đảm bảo không bao giờ bị lỗi CORS/Server Action
  addHostVariants('htxrautuyloan.com');
  addHostVariants('www.htxrautuyloan.com');

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
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'framer-motion',
      '@payloadcms/ui',
      '@payloadcms/richtext-lexical',
      'embla-carousel-react',
    ],
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

// Allow self-signed / cloud intermediate TLS certificates (Supabase, Neon, AWS RDS poolers, etc.)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { s3Storage } from '@payloadcms/storage-s3';
import { vi } from '@payloadcms/translations/languages/vi';
import { withRBAC, globalsWithRBAC } from './lib/rbac.ts';

// DATABASE_URI = custom Postgres URL (ưu tiên cao nhất)
// POSTGRES_PRISMA_URL = Supabase pgbouncer (port 6543, pgbouncer=true) — tối ưu cho serverless
// POSTGRES_URL_NON_POOLING = direct (port 5432) — giới hạn 15 kết nối, KHÔNG dùng cho serverless
// Vercel serverless cần pgbouncer để tránh "max clients reached"
const rawDbUrl = process.env.DATABASE_URI
  || process.env.POSTGRES_PRISMA_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_URL_NON_POOLING
  || process.env.DATABASE_URL;

// Dọn sạch URL: bỏ sslmode và pgbouncer param (pg driver xử lý SSL riêng)
const dbUrl = rawDbUrl
  ? rawDbUrl
    .replace(/[?&]sslmode=[^&]+/g, '')
    .replace(/[?&]pgbouncer=[^&]+/g, '')
    .replace(/[?&]supa=[^&]+/g, '')
    .replace(/[?&]uselibpqcompat=[^&]+/g, '')
    .replace(/\?&/, '?')
    .replace(/\?$/, '')
  : null;

import { Users } from './collections/Users.ts';
import { Media } from './collections/Media.ts';
import { MediaFolders } from './collections/MediaFolders.ts';
import { Categories } from './collections/Categories.ts';
import { Tags } from './collections/Tags.ts';
import { Articles } from './collections/Articles.ts';
import { Pages } from './collections/Pages.ts';
import { Banners } from './collections/Banners.ts';
import { Products } from './collections/Products.ts';
import { Certificates } from './collections/Certificates.ts';
import { Videos } from './collections/Videos.ts';
import { VideoChannels } from './collections/VideoChannels.ts';
import { Orders } from './collections/Orders.ts';
import { SiteSettings } from './globals/SiteSettings.ts';
import { SiteStats } from './globals/SiteStats.ts';


import { seedAccounts } from './lib/seedAccounts.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Tự động sinh danh sách CORS/CSRF từ biến môi trường.
 * Khi đổi domain, chỉ cần cập nhật NEXT_PUBLIC_SERVER_URL trên Coolify.
 *
 * Biến môi trường:
 *   NEXT_PUBLIC_SERVER_URL  — domain chính (bắt buộc)
 *   EXTRA_ALLOWED_ORIGINS   — các domain phụ, phân cách bằng dấu phẩy (tùy chọn)
 *                             Ví dụ: https://zalo.me,https://h5.zadn.vn
 */
function buildAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Luôn cho phép localhost dev
  origins.add('http://localhost:3000');
  origins.add('http://127.0.0.1:3000');

  // Helper: thêm cả www và non-www
  const addWithVariants = (urlStr: string) => {
    try {
      const url = new URL(urlStr.replace(/\/$/, ''));
      const { protocol, hostname, port } = url;
      const base = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
      origins.add(base);
      // Thêm cả www. và non-www.
      if (hostname.startsWith('www.')) {
        origins.add(`${protocol}//${hostname.slice(4)}${port ? ':' + port : ''}`);
      } else {
        origins.add(`${protocol}//www.${hostname}${port ? ':' + port : ''}`);
      }
      // Thêm subdomain cms.
      if (!hostname.startsWith('cms.')) {
        origins.add(`${protocol}//cms.${hostname.replace(/^www\./, '')}${port ? ':' + port : ''}`);
      }
    } catch {
      // URL không hợp lệ → bỏ qua
    }
  };

  // Tự động thêm domain chính từ NEXT_PUBLIC_SERVER_URL
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverURL) {
    addWithVariants(serverURL);
  }

  // Thêm Vercel deployment URLs (tự động inject bởi Vercel)
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    origins.add(`https://${vercelProductionUrl}`);
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  // Thêm cứng domain HTX để đảm bảo không bao giờ bị lỗi CSRF/CORS dù env có thay đổi
  addWithVariants('https://htxrautuyloan.com');
  addWithVariants('https://www.htxrautuyloan.com');

  // Thêm các domain phụ từ EXTRA_ALLOWED_ORIGINS
  const extra = process.env.EXTRA_ALLOWED_ORIGINS || '';
  extra.split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => origins.add(o));

  return Array.from(origins);
}

const allowedOriginsList = buildAllowedOrigins();

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 
             (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
             (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
             (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000'))),
  sharp,
  cors: allowedOriginsList,
  csrf: allowedOriginsList,
  onInit: async (payload) => {
    // Chỉ seed tài khoản mẫu khi ở chế độ development hoặc có cờ SEED_TEST_ACCOUNTS=true
    if (process.env.NODE_ENV === 'development' || process.env.SEED_TEST_ACCOUNTS === 'true') {
      await seedAccounts(payload);
    }

    // Khởi chạy Cronjob đồng bộ Video
    if (process.env.NODE_ENV !== 'development') { // Tránh chạy nhiều lần khi dev hot-reload
      const { initVideoSyncCron } = await import('./cron/videoSync.ts');
      initVideoSyncCron(payload);
    }
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' - HTX RAU AN TOÀN TÚY LOAN',
      description: 'Hệ thống quản trị HTX Rau An Toàn Túy Loan',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/logo.png',
        },
      ],
    },
    css: path.resolve(dirname, 'admin.css'),
    components: {
      graphics: {
        Logo: '@/app/(payload)/admin/components/AdminLogo.tsx#AdminLogo',
        Icon: '@/app/(payload)/admin/components/AdminIcon.tsx#AdminIcon',
      },
      views: {
        UserGuide: {
          Component: '@/components/Admin/UserGuideView.tsx',
          path: '/huong-dan',
        },
        BulkUpload: {
          Component: '@/components/Admin/BulkUploadView.tsx',
          path: '/bulk-upload',
        },
      },
      afterNavLinks: [
        '@/components/Admin/GuideNavLink.tsx',
        '@/components/Admin/BulkUploadLink.tsx',
      ],
      logout: {
        Button: '@/app/(payload)/admin/components/LogoutButton.tsx#LogoutButtonCustom',
      },
      beforeDashboard: [
        '@/components/Admin/QuickAccessDashboard.tsx#QuickAccessDashboard',
      ]
    }
  },
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
  },
  collections: withRBAC([
    Users,
    MediaFolders,
    Media,
    // Quản lý Nông Sản
    Products,
    Certificates,
    // Kinh doanh
    Orders,
    // Tin tức & Nội dung
    Categories,
    Tags,
    Articles,
    Pages,
    // Thư viện Video
    Videos,
    VideoChannels,
    // Tài nguyên & Giao diện
    Banners,
  ]),
  globals: globalsWithRBAC([
    SiteSettings,
    SiteStats,
  ]),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
    ...(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? [
          s3Storage({
            collections: {
              media: {
                // Nếu có S3_PUBLIC_URL (R2 public domain): trả trực tiếp
                // Nếu không: proxy qua /api/r2-proxy để fetch từ private R2
                generateFileURL: ({ filename }: { filename: string }) => {
                  const pubURL = process.env.S3_PUBLIC_URL;
                  if (pubURL) return `${pubURL}/${filename}`;
                  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000');
                  return `${serverURL}/api/r2-proxy?key=${encodeURIComponent(filename)}`;
                },
              },
            },
            bucket: process.env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              },
              region: process.env.S3_REGION || 'auto',
              endpoint: process.env.S3_ENDPOINT,
              // Required for Cloudflare R2 and MinIO:
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
            },
          }),
        ]
      : []),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'HTX_RAU_TUY_LOAN_PAYLOAD_SECRET_BUILD_FALLBACK_KEY_32CHARS',
  db: dbUrl
    ? postgresAdapter({
        pool: {
          connectionString: dbUrl,
          ssl: (() => {
            if ((rawDbUrl || '').includes('localhost') || (rawDbUrl || '').includes('127.0.0.1')) return false;
            return { rejectUnauthorized: false };
          })(),
          // Serverless-safe: giới hạn pool nhỏ, đóng kết nối nhàn rỗi nhanh
          max: 2,
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 5000,
        },
        push: false,
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_URL || 'file:./payload-data.db',
        },
        push: false,
      }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});

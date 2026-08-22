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

// DATABASE_URI = custom Postgres URL
// POSTGRES_URL = auto-injected by Vercel Postgres addon
const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

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

  // Tự động thêm domain chính từ NEXT_PUBLIC_SERVER_URL
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverURL) {
    origins.add(serverURL.replace(/\/$/, '')); // bỏ trailing slash
    try {
      const url = new URL(serverURL);
      const { protocol, hostname } = url;
      // Thêm cả subdomain cms. tương ứng
      if (!hostname.startsWith('cms.')) {
        origins.add(`${protocol}//cms.${hostname}`);
      }
      // Nếu có port thì thêm cả URL không có port
      if (url.port) {
        origins.add(`${protocol}//${hostname}`);
      }
    } catch {
      // URL không hợp lệ → bỏ qua
    }
  }

  // Thêm các domain phụ từ EXTRA_ALLOWED_ORIGINS
  const extra = process.env.EXTRA_ALLOWED_ORIGINS || '';
  extra.split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => origins.add(o));

  return Array.from(origins);
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  sharp,
  cors: '*',
  csrf: buildAllowedOrigins(),
  onInit: async (payload) => {
    await seedAccounts(payload);

    
    // Khởi chạy Cronjob đồng bộ Video
    if (process.env.NODE_ENV !== 'development') { // Tránh chạy nhiều lần khi dev hot-reload
      const { initVideoSyncCron } = await import('./cron/videoSync.ts');
      initVideoSyncCron();
    }
  },
  admin: {
    user: 'users',
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
      beforeDashboard: [
        '@/app/(payload)/admin/components/AuthorWelcome.tsx#AuthorWelcome',
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
              media: true,
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
  secret: process.env.PAYLOAD_SECRET || 'YOUR-SUPER-SECRET-KEY',
  db: dbUrl
    ? postgresAdapter({
        pool: {
          connectionString: dbUrl,
        },
        push: (() => {
          const val = String(process.env.PAYLOAD_FORCE_PUSH || '').toLowerCase().trim();
          return val === 'true' || val === '1' || val === 'yes' || process.env.NODE_ENV === 'development';
        })(),
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_URL || 'file:./payload-data.db',
        },
        push: true,
      }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});

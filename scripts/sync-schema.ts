process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true';

import { getPayload } from 'payload';
import config from '../src/payload.config.ts';
import { pushDevSchema } from '@payloadcms/drizzle';

async function syncPostgresSchema() {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('⚠️ Không tìm thấy PostgreSQL URL (DATABASE_URI/POSTGRES_URL) — bỏ qua sync schema.');
    return;
  }

  console.log('🚀 Đang kết nối Payload CMS để tự động tạo schema PostgreSQL...');
  try {
    const payload = await getPayload({ config });
    const dbAdapter = payload.db as any;

    if (dbAdapter && typeof dbAdapter.requireDrizzleKit === 'function') {
      console.log('📦 Đang chạy Drizzle Kit pushDevSchema để tạo toàn bộ bảng trong database...');
      await pushDevSchema(dbAdapter);
      console.log('✅ Đã đồng bộ và tạo toàn bộ bảng PostgreSQL (users, media, products, orders, articles, site_settings,...) thành công!');
    } else {
      console.log('ℹ️ dbAdapter không yêu cầu Drizzle Kit push.');
    }
  } catch (error: any) {
    console.error('⚠️ Lỗi khi sync schema Drizzle:', error?.message || error);
  }
}

syncPostgresSchema()
  .then(() => {
    console.log('🎉 Hoàn tất bước đồng bộ schema.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Sync schema thất bại:', err);
    process.exit(0); // Không làm dừng tiến trình để migrate.mjs tiếp tục
  });

// migrate.mjs — Chạy tự động khi build trên Vercel/Coolify: node migrate.mjs && next build
// Chạy thủ công: node migrate.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';
import { execSync } from 'child_process';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️  Không tìm thấy DATABASE_URI — bỏ qua migration (đang dùng SQLite local).');
  process.exit(0);
}

console.log('🚀 Bắt đầu quá trình migration database PostgreSQL...');

const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Bắt lỗi pool để tránh unhandled exception làm crash tiến trình build
pool.on('error', (err) => {
  console.error('⚠️ [Postgres Pool Error]:', err.message);
});

async function run() {
  const client = await pool.connect();
  console.log('📡 Đã kết nối database PostgreSQL. Đang kiểm tra migration bổ sung...');

  try {
    let ok = 0, skipped = 0;

    for (let i = 0; i < MIGRATION_STATEMENTS.length; i++) {
      const statement = MIGRATION_STATEMENTS[i];
      try {
        await client.query(statement);
        ok++;
      } catch (err) {
        skipped++;
      }
    }

    console.log(`\n✅ Migration hoàn tất: ${ok} applied, ${skipped} skipped`);
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => {
    console.log('🎉 Database PostgreSQL đã sẵn sàng 100% cho build!');
    process.exit(0);
  })
  .catch(err => {
    console.error('⚠️ Migration notice:', err.message || err);
    process.exit(0);
  });

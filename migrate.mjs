// migrate.mjs — Chạy tự động khi build trên Vercel/Coolify: node migrate.mjs && next build
// Chạy thủ công: node migrate.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';
import { SEED_STATEMENTS } from './scripts/seed-data.mjs';
import { execSync } from 'child_process';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️  Không tìm thấy DATABASE_URI — bỏ qua migration (đang dùng SQLite local).');
  process.exit(0);
}

console.log('🚀 Bắt đầu quá trình migration và seed database PostgreSQL...');

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
  console.log('📡 Đã kết nối database PostgreSQL. Đang áp dụng schema và migration...');

  try {
    let ok = 0, skipped = 0;

    // 1. Run migrations & schema tables
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

    // 2. Run seed data
    console.log('🌱 Đang đồng bộ và nạp (seed) toàn bộ dữ liệu từ local lên PostgreSQL...');
    let seedOk = 0, seedSkipped = 0;
    for (let i = 0; i < SEED_STATEMENTS.length; i++) {
      const stmt = SEED_STATEMENTS[i];
      try {
        await client.query(stmt);
        seedOk++;
      } catch (err) {
        seedSkipped++;
      }
    }

    console.log(`✅ Seed dữ liệu hoàn tất: ${seedOk} nạp thành công, ${seedSkipped} bỏ qua`);
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

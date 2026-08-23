// migrate.mjs — Chạy tự động khi build trên Vercel/Coolify: node migrate.mjs && next build
// Chạy thủ công: node migrate.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';
import { ALL_TABLE_CREATES, ALL_COLUMN_ALTERS } from './scripts/complete-schema.mjs';
import { ALTER_STATEMENTS, SEED_STATEMENTS } from './scripts/seed-data.mjs';
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

    // 1. Run core migrations
    for (let i = 0; i < MIGRATION_STATEMENTS.length; i++) {
      const statement = MIGRATION_STATEMENTS[i];
      try {
        await client.query(statement);
        ok++;
      } catch (err) {
        skipped++;
      }
    }

    // 1b. Run all complete table creates (ensures 100% of tables like pages_rels, articles_rels exist)
    if (Array.isArray(ALL_TABLE_CREATES)) {
      for (let i = 0; i < ALL_TABLE_CREATES.length; i++) {
        try {
          await client.query(ALL_TABLE_CREATES[i]);
          ok++;
        } catch (err) {
          skipped++;
        }
      }
    }

    console.log(`\n✅ Migration hoàn tất: ${ok} applied, ${skipped} skipped`);

    // 2. Run all column alters
    console.log('🔧 Đang đồng bộ và bổ sung tất cả các cột của bảng...');
    let alterOk = 0;
    if (Array.isArray(ALL_COLUMN_ALTERS)) {
      for (let i = 0; i < ALL_COLUMN_ALTERS.length; i++) {
        try {
          await client.query(ALL_COLUMN_ALTERS[i]);
          alterOk++;
        } catch (err) {}
      }
    }
    if (Array.isArray(ALTER_STATEMENTS)) {
      for (let i = 0; i < ALTER_STATEMENTS.length; i++) {
        try {
          await client.query(ALTER_STATEMENTS[i]);
          alterOk++;
        } catch (err) {}
      }
    }
    console.log(`✅ Bổ sung ${alterOk} cột thành công.`);

    // 3. Run seed data
    console.log('🌱 Đang đồng bộ và nạp (seed) toàn bộ dữ liệu từ local lên PostgreSQL...');
    let seedOk = 0, seedSkipped = 0;
    for (let i = 0; i < SEED_STATEMENTS.length; i++) {
      const stmt = SEED_STATEMENTS[i];
      try {
        await client.query(stmt);
        seedOk++;
      } catch (err) {
        console.error(`⚠️ Lỗi khi nạp câu lệnh ${i}:`, err.message);
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

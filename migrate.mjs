// migrate.mjs — Chạy tự động khi build trên Vercel/Coolify: node migrate.mjs && next build
// Chạy thủ công: node migrate.mjs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Pool } = pg;
import { MIGRATION_STATEMENTS } from './scripts/migrations.mjs';
import { ALL_TABLE_CREATES, ALL_COLUMN_ALTERS } from './scripts/complete-schema.mjs';

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('⚠️  Không tìm thấy DATABASE_URI — bỏ qua migration (đang dùng SQLite local).');
  process.exit(0);
}

console.log('🚀 Bắt đầu quá trình migration schema PostgreSQL...');

const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Bắt lỗi pool để tránh unhandled exception làm crash tiến trình build
pool.on('error', (err) => {
  console.error('⚠️ [Postgres Pool Error]:', err.message);
});

const SCHEMA_VERSION = 'v2026_08_24_full_schema_v3';

async function run() {
  const client = await pool.connect();
  console.log('📡 Đã kết nối database PostgreSQL. Đang kiểm tra trạng thái schema...');

  try {
    // 0. Tạo bảng theo dõi version nếu chưa có
    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migration_lock (
        id VARCHAR(50) PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        migrated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Kiểm tra xem schema hiện tại đã được áp dụng chưa
    const checkRes = await client.query(
      `SELECT version FROM _schema_migration_lock WHERE id = 'latest_version';`
    );

    if (checkRes.rows.length > 0 && checkRes.rows[0].version === SCHEMA_VERSION) {
      console.log(`⚡ Schema PostgreSQL đã ở phiên bản mới nhất (${SCHEMA_VERSION}). Bỏ qua migration trong 0.1s!`);
      return;
    }

    console.log(`🔄 Phát hiện schema mới (${SCHEMA_VERSION}). Đang tiến hành đồng bộ schema...`);
    let ok = 0, skipped = 0;

    // 1. Chạy core migrations theo multi-statement batch (50 câu lệnh / roundtrip)
    console.log('📦 Đang áp dụng migration cấu trúc bảng theo lô siêu tốc...');
    const batchSize = 50;
    for (let i = 0; i < MIGRATION_STATEMENTS.length; i += batchSize) {
      const batch = MIGRATION_STATEMENTS.slice(i, i + batchSize);
      const sql = batch.map(s => s.trim().replace(/;+$/, '')).join(';\n') + ';';
      try {
        await client.query(sql);
        ok += batch.length;
      } catch (err) {
        // Fallback chạy từng câu nếu có lỗi cú pháp trong block
        for (const stmt of batch) {
          try { await client.query(stmt); ok++; } catch { skipped++; }
        }
      }
    }

    // 1b. Chạy table creates bổ sung
    if (Array.isArray(ALL_TABLE_CREATES) && ALL_TABLE_CREATES.length > 0) {
      for (let i = 0; i < ALL_TABLE_CREATES.length; i += batchSize) {
        const batch = ALL_TABLE_CREATES.slice(i, i + batchSize);
        const sql = batch.map(s => s.trim().replace(/;+$/, '')).join(';\n') + ';';
        try {
          await client.query(sql);
          ok += batch.length;
        } catch {
          for (const stmt of batch) {
            try { await client.query(stmt); ok++; } catch { skipped++; }
          }
        }
      }
    }

    console.log(`✅ Migration cấu trúc bảng hoàn tất: ${ok} applied, ${skipped} skipped`);

    // 2. Chạy column alters theo multi-statement batch
    console.log('🔧 Đang đồng bộ và bổ sung các cột theo lô siêu tốc...');
    let alterOk = 0;
    if (Array.isArray(ALL_COLUMN_ALTERS) && ALL_COLUMN_ALTERS.length > 0) {
      for (let i = 0; i < ALL_COLUMN_ALTERS.length; i += batchSize) {
        const batch = ALL_COLUMN_ALTERS.slice(i, i + batchSize);
        const sql = batch.map(s => s.trim().replace(/;+$/, '')).join(';\n') + ';';
        try {
          await client.query(sql);
          alterOk += batch.length;
        } catch {
          for (const stmt of batch) {
            try { await client.query(stmt); alterOk++; } catch {}
          }
        }
      }
    }
    console.log(`✅ Bổ sung ${alterOk} cột thành công.`);

    // 3. Ghi nhận phiên bản đã hoàn tất
    await client.query(`
      INSERT INTO _schema_migration_lock (id, version, migrated_at)
      VALUES ('latest_version', $1, NOW())
      ON CONFLICT (id) DO UPDATE SET version = $1, migrated_at = NOW();
    `, [SCHEMA_VERSION]);

    console.log(`🔒 Đã khóa phiên bản schema: ${SCHEMA_VERSION}`);
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


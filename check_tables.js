const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URI || 'postgresql://postgres:123456@127.0.0.1:5432/webcq' });

async function main() {
  // Tìm tất cả bảng liên quan đến site_settings và home_sections
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' 
      AND (table_name LIKE '%site_settings%' OR table_name LIKE '%home_section%' OR table_name LIKE '%latest_news%' OR table_name LIKE '%ad_slider%')
    ORDER BY table_name;
  `);
  console.log('Tables found:', res.rows.map(r => r.table_name));

  // Cũng kiểm tra global table
  const res2 = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' AND table_name LIKE '%global%'
    ORDER BY table_name;
  `);
  console.log('\nGlobal tables:', res2.rows.map(r => r.table_name));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

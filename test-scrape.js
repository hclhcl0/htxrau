const { Client } = require('pg');
const c = new Client({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });
c.connect().then(() =>
  c.query(`SELECT slug, LEFT(description, 100) as desc_preview, LENGTH(description) as desc_len 
           FROM articles ORDER BY created_at DESC LIMIT 30`)
).then(r => {
  const missing = r.rows.filter(row => !row.desc_len || row.desc_len < 50);
  const short = r.rows.filter(row => row.desc_len >= 50 && row.desc_len < 150);
  const ok = r.rows.filter(row => row.desc_len >= 150);
  console.log(`\nKết quả (30 bài mới nhất):`);
  console.log(`  ✅ Đủ (>=150 ký tự): ${ok.length}`);
  console.log(`  ⚠️  Ngắn (50-149 ký tự): ${short.length}`);
  console.log(`  ❌ Thiếu (<50 hoặc NULL): ${missing.length}`);
  
  console.log('\n--- Bài thiếu/ngắn ---');
  [...missing, ...short].forEach(row => {
    console.log(`[${row.desc_len || 0}] ${row.slug?.substring(0,50)}`);
    console.log(`     => ${row.desc_preview || 'NULL'}`);
  });
  
  c.end();
}).catch(console.error);

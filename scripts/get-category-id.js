const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT id FROM categories WHERE slug = 'cam-nang'`);
    if (res.rows.length > 0) {
      console.log('CATEGORY_ID=' + res.rows[0].id);
    } else {
      console.log('Not found');
    }
  } finally {
    client.release();
    pool.end();
  }
}
run();

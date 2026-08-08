const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT id, title, slug FROM categories`);
    console.log(res.rows);
  } finally {
    client.release();
    pool.end();
  }
}
run();

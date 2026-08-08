const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgres://postgres:123456@127.0.0.1:5432/webcq"
  });

  await client.connect();

  const res = await client.query("SELECT id, version_title, version_slug FROM _articles_v WHERE version_slug LIKE '%cap-nhat%'");
  console.log(res.rows);

  await client.end();
}

fix().catch(console.error);

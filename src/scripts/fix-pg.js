const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgres://postgres:123456@127.0.0.1:5432/webcq"
  });

  await client.connect();

  const res = await client.query(`SELECT id, title, slug FROM articles WHERE slug LIKE '%/%'`);
  console.log(`Found ${res.rows.length} articles with slashes.`);

  for (const row of res.rows) {
    const newSlug = row.slug.replace(/\//g, '-');
    console.log(`Updating ${row.slug} -> ${newSlug}`);
    await client.query(`UPDATE articles SET slug = $1 WHERE id = $2`, [newSlug, row.id]);
  }

  await client.end();
  console.log('Done!');
}

fix().catch(console.error);

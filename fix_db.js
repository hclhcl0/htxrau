const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });
client.connect()
  .then(() => client.query('UPDATE articles SET "published_at" = "created_at" WHERE "published_at" IS NULL;'))
  .then(res => { console.log('Updated:', res.rowCount); client.end(); })
  .catch(console.error);

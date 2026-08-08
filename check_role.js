const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URI || 'postgres://postgres:postgres@127.0.0.1:5432/webcq' });
pool.query("SELECT email, role FROM users WHERE email = 'hclhcl0@gmail.com'")
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => process.exit(0));

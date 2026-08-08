const pg = require('pg');

const pool = new pg.Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });

async function test() {
  const client = await pool.connect();
  try {
    await client.query(`DROP TABLE IF EXISTS "test_pk_alter" CASCADE;`);
    await client.query(`
      CREATE TABLE "test_pk_alter" (
        "id" serial PRIMARY KEY NOT NULL
      );
    `);
    await client.query(`INSERT INTO "test_pk_alter" DEFAULT VALUES;`);
    console.log("Created table with serial PK.");

    await client.query(`
      ALTER TABLE "test_pk_alter" ALTER COLUMN "id" DROP DEFAULT;
      ALTER TABLE "test_pk_alter" ALTER COLUMN "id" TYPE varchar;
    `);
    console.log("Altered PK type to varchar!");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    client.release();
    pool.end();
  }
}

test();

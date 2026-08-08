const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "media_folders" (
        "id" varchar PRIMARY KEY NOT NULL,
        "title" varchar,
        "slug" varchar,
        "parent_id" varchar,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      );
      ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "folder_id" varchar;

      CREATE TABLE IF NOT EXISTS "categories_rels" (
        "id" serial PRIMARY KEY NOT NULL,
        "order" integer,
        "parent_id" integer NOT NULL,
        "path" varchar NOT NULL,
        "departments_id" integer
      );
      CREATE INDEX IF NOT EXISTS "categories_rels_order_idx" ON "categories_rels" ("order");
      CREATE INDEX IF NOT EXISTS "categories_rels_parent_idx" ON "categories_rels" ("parent_id");
      CREATE INDEX IF NOT EXISTS "categories_rels_path_idx" ON "categories_rels" ("path");
    `);
    console.log('Schema fixed!');
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();

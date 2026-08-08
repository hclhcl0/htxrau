const pg = require('pg');

const pool = new pg.Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/webcq' });

async function test() {
  const client = await pool.connect();
  try {
    // 1. Drop existing tables
    await client.query(`DROP TABLE IF EXISTS "site_settings_menu_menu_items_sub_items" CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "site_settings_menu_menu_items" CASCADE;`);

    // 2. Create tables with INTEGER ids like production
    await client.query(`
      CREATE TABLE "site_settings_menu_menu_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "label" varchar NOT NULL,
        "url" varchar,
        "preset_url" varchar,
        "open_in_new_tab" boolean
      );
    `);
    
    await client.query(`
      CREATE TABLE "site_settings_menu_menu_items_sub_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "label" varchar NOT NULL,
        "url" varchar NOT NULL,
        "preset_url" varchar,
        "open_in_new_tab" boolean,
        CONSTRAINT "site_settings_menu_menu_items_sub_items_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "site_settings_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action
      );
    `);

    // 3. Insert some data to ensure casting handles existing data
    await client.query(`INSERT INTO "site_settings_menu_menu_items" ("_order", "_parent_id", "label") VALUES (1, 13, 'Test');`);
    
    console.log("Simulated production schema created.");

    // 4. Run the exact DO block from my migration WITHOUT the EXCEPTION WHEN others block
    // to see the REAL error!
    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE "site_settings_menu_menu_items_sub_items" DROP CONSTRAINT IF EXISTS "site_settings_menu_menu_items_sub_items_parent_fk";

        ALTER TABLE "site_settings_menu_menu_items" ALTER COLUMN "id" DROP DEFAULT;
        ALTER TABLE "site_settings_menu_menu_items" ALTER COLUMN "id" TYPE varchar;

        ALTER TABLE "site_settings_menu_menu_items_sub_items" ALTER COLUMN "_parent_id" TYPE varchar;
        ALTER TABLE "site_settings_menu_menu_items_sub_items" ALTER COLUMN "id" DROP DEFAULT;
        ALTER TABLE "site_settings_menu_menu_items_sub_items" ALTER COLUMN "id" TYPE varchar;

        ALTER TABLE "site_settings_menu_menu_items_sub_items"
          ADD CONSTRAINT "site_settings_menu_menu_items_sub_items_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "site_settings_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action;
      END $$;
    `);

    console.log("DO block executed successfully!");

  } catch (err) {
    console.error("Error executing DO block:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

test();

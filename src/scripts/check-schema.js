const { Client } = require('pg');

async function checkSchema() {
  const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/webcq';
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    
    // Check columns of site_settings_menu_menu_items
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'site_settings_menu_menu_items';`);
    console.log("Columns:", res.rows);

    // Also get all rows to see their IDs
    const res2 = await client.query(`SELECT id FROM site_settings_menu_menu_items LIMIT 5;`);
    console.log("Existing IDs:", res2.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkSchema();

const { Client } = require('pg');

async function testInsert() {
  const dbUrl = process.env.DATABASE_URI || 'postgres://postgres:123456@127.0.0.1:5432/webcq';
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    
    // Check columns of subItems
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'site_settings_menu_menu_items_sub_items';`);
    console.log("Columns of subItems:", res.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

testInsert();

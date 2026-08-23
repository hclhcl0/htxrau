import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./payload-data.db');

const tablesToExport = [
  'users',
  'categories',
  'tags',
  'media_folders',
  'media',
  'products',
  'products_gallery',
  'products_season_availability',
  'products_rels',
  'certificates',
  'orders',
  'orders_items',
  'articles',
  'articles_rels',
  'pages',
  'videos',
  'video_channels',
  'banners',
  'site_stats',
  'site_settings',
  'site_settings_banner_sidebar_banners',
  'site_settings_blocks_commitment_section',
  'site_settings_blocks_product_section',
  'site_settings_blocks_process_steps_section',
  'site_settings_blocks_certificates_section',
  'site_settings_blocks_latest_news_section',
  'site_settings_blocks_news_category_section',
  'site_settings_blocks_banner_section',
  'site_settings_blocks_multi_banner_section',
  'site_settings_blocks_multi_banner_section_banners',
  'site_settings_blocks_video_section',
  'site_settings_blocks_stats_section',
  'site_settings_blocks_stats_section_stats',
  'site_settings_blocks_quick_links_section',
  'site_settings_blocks_quick_links_section_links',
  'site_settings_footer_quick_links',
  'site_settings_footer_social_links',
  'site_settings_menu_menu_items',
  'site_settings_menu_menu_items_sub_items',
  'site_settings_blocks_category_news',
  'site_settings_blocks_categories_widget',
  'site_settings_blocks_recent_articles_widget',
  'site_settings_blocks_banner_widget',
  'site_settings_blocks_custom_html_widget',
  'site_settings_popup_services_items'
];

function escapePgValue(val, colName) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'string') {
    // Escape single quotes
    const escaped = val.replace(/'/g, "''");
    return `'${escaped}'`;
  }
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

let allSql = [];

// Also ensure products_gallery and products_season_availability tables exist in Postgres
allSql.push(`
  CREATE TABLE IF NOT EXISTS "products_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar
  );
  CREATE TABLE IF NOT EXISTS "products_season_availability" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "month" varchar
  );
`);

for (const tableName of tablesToExport) {
  // Check if table exists in SQLite
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
  if (!tableCheck) continue;

  const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
  if (rows.length === 0) continue;

  console.log(`Exporting ${rows.length} rows from ${tableName}...`);

  for (const row of rows) {
    const cols = Object.keys(row);
    const colNames = cols.map(c => `"${c}"`).join(', ');
    const values = cols.map(c => escapePgValue(row[c], c)).join(', ');

    // Primary key is usually id
    if (cols.includes('id')) {
      const updateSet = cols
        .filter(c => c !== 'id')
        .map(c => `"${c}" = EXCLUDED."${c}"`)
        .join(', ');

      if (updateSet.length > 0) {
        allSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO UPDATE SET ${updateSet};`);
      } else {
        allSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;`);
      }
    } else {
      allSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
    }
  }

  // Update sequences for tables with serial id
  if (rows[0] && typeof rows[0].id === 'number') {
    allSql.push(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), true);`);
  }
}

// Write to seed-data.js module
const outputJs = `// Auto-generated seed data from local SQLite
export const SEED_STATEMENTS = ${JSON.stringify(allSql, null, 2)};
`;

fs.writeFileSync('./scripts/seed-data.mjs', outputJs);
console.log(`✅ Generated ./scripts/seed-data.mjs with ${allSql.length} SQL operations!`);

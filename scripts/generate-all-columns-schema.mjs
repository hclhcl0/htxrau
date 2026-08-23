import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./payload-data.db');

const tables = [
  'users',
  'categories',
  'tags',
  'media_folders',
  'media',
  'products',
  'products_gallery',
  'products_season_availability',
  'certificates',
  'orders',
  'orders_items',
  'articles',
  'pages',
  'videos',
  'video_channels',
  'banners',
  'site_stats',
  'site_settings',
  'site_settings_blocks_product_section',
  'site_settings_blocks_latest_news_section',
  'site_settings_menu_menu_items'
];

const booleanColumns = new Set([
  'auto_zalo_broadcast',
  'is_pinned',
  'is_featured',
  'featured',
  'is_a_i_generated',
  'active',
  'is_active',
  'open_in_new_tab',
  'show_price',
  'show_in_menu',
  'published'
]);

function isBoolCol(colName) {
  if (booleanColumns.has(colName)) return true;
  if (colName.startsWith('is_') || colName.startsWith('auto_') || colName.startsWith('has_') || colName.endsWith('_tab')) return true;
  return false;
}

let alterSqls = [];

for (const table of tables) {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table);
  if (!tableCheck) continue;

  const row = db.prepare(`SELECT * FROM "${table}" LIMIT 1`).get();
  if (!row) continue;

  const cols = Object.keys(row);
  for (const col of cols) {
    if (col === 'id') continue;
    // determine type roughly
    const val = row[col];
    let type = 'varchar';
    if (isBoolCol(col)) {
      type = 'boolean';
    } else if (typeof val === 'number') {
      type = 'numeric';
    } else if (typeof val === 'boolean') {
      type = 'boolean';
    } else if (col === 'content' || col === 'home_content' || col === 'items' || (typeof val === 'string' && val.startsWith('{"root"'))) {
      type = 'jsonb';
    } else if (col.includes('_at') || col.includes('date') || col === 'lock_until') {
      type = 'timestamp(3) with time zone';
    }

    alterSqls.push(`DO $$ BEGIN ALTER TABLE "${table}" ADD COLUMN "${col}" ${type}; EXCEPTION WHEN duplicate_column THEN null; END $$;`);
  }
}

console.log(`Generated ${alterSqls.length} ALTER statements.`);

// Let's also re-generate seed SQL where JSON strings are properly cast
const tablesToExport = [
  'users',
  'categories',
  'tags',
  'media_folders',
  'media',
  'products',
  'products_gallery',
  'products_season_availability',
  'certificates',
  'orders',
  'orders_items',
  'articles',
  'pages',
  'videos',
  'video_channels',
  'banners',
  'site_stats',
  'site_settings',
  'site_settings_blocks_product_section',
  'site_settings_blocks_latest_news_section',
  'site_settings_menu_menu_items'
];

function escapePgValue(val, colName) {
  if (val === null || val === undefined) return 'NULL';

  if (isBoolCol(colName)) {
    if (val === 1 || val === '1' || val === true || val === 'true') return 'TRUE';
    if (val === 0 || val === '0' || val === false || val === 'false') return 'FALSE';
    return 'FALSE';
  }

  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (colName === 'content' || colName === 'home_content' || colName === 'items' || (val.startsWith('{"root"') && val.endsWith('}'))) {
      try {
        JSON.parse(val);
        const jsonEscaped = val.replace(/'/g, "''");
        return `'${jsonEscaped}'::jsonb`;
      } catch (e) {}
    }
    const escaped = val.replace(/'/g, "''");
    return `'${escaped}'`;
  }
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

let seedSql = [];

for (const tableName of tablesToExport) {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
  if (!tableCheck) continue;

  const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
  if (rows.length === 0) continue;

  for (const row of rows) {
    const cols = Object.keys(row);
    const colNames = cols.map(c => `"${c}"`).join(', ');
    const values = cols.map(c => escapePgValue(row[c], c)).join(', ');

    if (cols.includes('id')) {
      const updateSet = cols
        .filter(c => c !== 'id')
        .map(c => `"${c}" = EXCLUDED."${c}"`)
        .join(', ');

      if (updateSet.length > 0) {
        seedSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO UPDATE SET ${updateSet};`);
      } else {
        seedSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;`);
      }
    } else {
      seedSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
    }
  }

  if (rows[0] && typeof rows[0].id === 'number') {
    seedSql.push(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), true);`);
  }
}

const fullSeedMjs = `// Auto-generated seed data
export const ALTER_STATEMENTS = ${JSON.stringify(alterSqls, null, 2)};
export const SEED_STATEMENTS = ${JSON.stringify(seedSql, null, 2)};
`;

fs.writeFileSync('./scripts/seed-data.mjs', fullSeedMjs);
console.log(`✅ Generated ./scripts/seed-data.mjs with ${alterSqls.length} ALTERs and ${seedSql.length} SEEDs!`);

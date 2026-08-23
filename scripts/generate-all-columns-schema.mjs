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

// ─── Column name mapping: SQLite col → Postgres col ───────────────────────────
// PayloadCMS uses _order / _parent_id / _locale in Postgres but SQLite sometimes
// stores them differently.
const COL_NAME_MAP = {
  'order': '_order',   // products_season_availability.order → _order
};

function pgColName(col) {
  return COL_NAME_MAP[col] ?? col;
}

// ─── Auto-detect boolean columns using PRAGMA ────────────────────────────────
// An INTEGER column where ALL sampled values are 0, 1, or NULL is treated as boolean.
// Also a small explicit set for safety (column naming conventions vary).
// Columns that look like integers but are NEVER boolean: IDs, order, counts
const NON_BOOL_COLS = new Set(['id', '_order', 'order', '_parent_id', 'parent_id', 'views',
  'price', 'original_price', 'filesize', 'width', 'height', 'focal_x', 'focal_y',
  'quantity', 'unit_price', 'total_amount', 'order_num', 'harvest_cycle_days',
  'login_attempts', 'image_id', 'category_id', 'author_id', 'folder_id',
  'assigned_to_id', 'file_id', 'avatar_id']);

function isLikelyFkCol(colName) {
  if (NON_BOOL_COLS.has(colName)) return true;
  // columns ending with _id or starting with sizes_ (image dimensions) are never boolean
  if (colName.endsWith('_id') || colName.startsWith('sizes_')) return true;
  // order/count columns
  if (colName === '_order' || colName === 'order') return true;
  return false;
}

function buildBoolSet(tableName) {
  const pragma = db.prepare(`PRAGMA table_info("${tableName}")`).all();
  const bools = new Set();
  for (const col of pragma) {
    if (col.name === 'id' || isLikelyFkCol(col.name)) continue;
    if (col.type === 'integer' || col.type === 'INTEGER') {
      // Sample to confirm boolean (all 0/1/null)
      const sample = db.prepare(`SELECT "${col.name}" FROM "${tableName}" LIMIT 20`).all();
      const vals = sample.map(r => r[col.name]).filter(v => v !== null && v !== undefined);
      const isBool = vals.length === 0 || vals.every(v => v === 0 || v === 1);
      if (isBool) {
        bools.add(col.name);
      }
    }
  }
  return bools;
}

// ─── Escape a value for PostgreSQL ───────────────────────────────────────────
function escapePgValue(val, colName, boolCols) {
  if (val === null || val === undefined) return 'NULL';

  if (boolCols.has(colName)) {
    if (val === 1 || val === '1' || val === true || val === 'true') return 'TRUE';
    return 'FALSE'; // 0, null already handled above
  }

  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') {
    // Detect JSON (jsonb)
    if (
      (val.startsWith('{') && val.endsWith('}')) ||
      (val.startsWith('[') && val.endsWith(']'))
    ) {
      try {
        JSON.parse(val);
        return `'${val.replace(/'/g, "''")}'::jsonb`;
      } catch (_) {}
    }
    return `'${val.replace(/'/g, "''")}'`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ─── Type inference for ALTER TABLE ──────────────────────────────────────────
function pgType(col, val, boolCols) {
  if (boolCols.has(col)) return 'boolean';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') return 'numeric';
  if (typeof val === 'string') {
    if (
      col === 'content' || col === 'home_content' || col === 'items' ||
      val.startsWith('{"root"') || val.startsWith('{"type"')
    ) return 'jsonb';
    if (col.endsWith('_at') || col.includes('date') || col === 'lock_until') {
      return 'timestamp(3) with time zone';
    }
  }
  return 'varchar';
}

// ─── Build ALTER statements ───────────────────────────────────────────────────
let alterSqls = [];

for (const table of tables) {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table);
  if (!tableCheck) continue;

  const row = db.prepare(`SELECT * FROM "${table}" LIMIT 1`).get();
  if (!row) continue;

  const boolCols = buildBoolSet(table);

  for (const col of Object.keys(row)) {
    if (col === 'id') continue;
    const pgCol = pgColName(col);
    const type = pgType(col, row[col], boolCols);
    alterSqls.push(`DO $$ BEGIN ALTER TABLE "${table}" ADD COLUMN "${pgCol}" ${type}; EXCEPTION WHEN duplicate_column THEN null; END $$;`);
  }
}

console.log(`Generated ${alterSqls.length} ALTER statements.`);

// ─── Build SEED statements ───────────────────────────────────────────────────
let seedSql = [];

for (const tableName of tables) {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
  if (!tableCheck) continue;

  const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
  if (rows.length === 0) continue;

  const boolCols = buildBoolSet(tableName);

  for (const row of rows) {
    const sqliteCols = Object.keys(row);
    const pgCols = sqliteCols.map(pgColName);

    const colNames = pgCols.map(c => `"${c}"`).join(', ');
    const values = sqliteCols.map(c => escapePgValue(row[c], c, boolCols)).join(', ');

    if (sqliteCols.includes('id')) {
      const updateSet = pgCols
        .filter(c => c !== 'id')
        .map(c => `"${c}" = EXCLUDED."${c}"`)
        .join(', ');

      if (updateSet.length > 0) {
        seedSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO UPDATE SET ${updateSet};`);
      } else {
        seedSql.push(`INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;`);
      }
    } else {
      // No id col - use DO NOTHING to avoid duplicates
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

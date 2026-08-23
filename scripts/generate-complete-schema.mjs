import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./payload-data.db');
const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  .map(t => t.name)
  .filter(name => !name.startsWith('sqlite_') && name !== 'payload_migrations');

console.log(`Đang phân tích ${allTables.length} bảng từ SQLite...`);

const createTableStatements = [];
const alterTableStatements = [];

for (const tableName of allTables) {
  const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
  
  const colDefs = columns.map(c => {
    let colName = `"${c.name}"`;
    let type = 'varchar';
    let lower = (c.type || '').toLowerCase();
    let nameLower = c.name.toLowerCase();

    if (c.pk) {
      return `${colName} serial PRIMARY KEY NOT NULL`;
    }
    if (nameLower === '_order' || nameLower === 'order' || nameLower === '_parent_id' || nameLower === 'parent_id' || nameLower.endsWith('_id') || nameLower === 'views' || nameLower === 'limit' || nameLower === 'order_num' || nameLower === 'quantity') {
      type = 'integer';
    } else if (lower.includes('int')) {
      type = 'integer';
    } else if (lower.includes('numeric') || lower.includes('real') || lower.includes('float') || nameLower.includes('price') || nameLower === 'views' || nameLower.endsWith('_width') || nameLower.endsWith('_height') || nameLower.endsWith('_filesize')) {
      type = 'numeric';
    } else if (lower.includes('json') || nameLower === 'content' || nameLower === 'data' || nameLower === 'items') {
      type = 'jsonb';
    } else if (nameLower.startsWith('is_') || nameLower.startsWith('auto_') || nameLower === 'featured' || nameLower === 'latest' || nameLower === 'autoplay' || nameLower === 'open_in_new_tab' || nameLower === 'primary_button_open_in_new_tab' || nameLower === 'secondary_button_open_in_new_tab') {
      type = 'boolean DEFAULT false';
    } else if (nameLower.endsWith('_at') || nameLower.endsWith('_date') || lower.includes('timestamp') || nameLower === 'expires_at' || nameLower === 'lock_until' || nameLower === 'reset_password_expiration') {
      type = 'timestamp(3) with time zone DEFAULT now()';
    }

    let extra = '';
    if (c.notnull && !type.includes('PRIMARY KEY')) {
      extra = ' NOT NULL';
    }
    return `${colName} ${type}${extra}`;
  });

  const createSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(',\n  ')}\n);`;
  createTableStatements.push(createSql);

  // Column alters for every single column to guarantee table has all fields even if table was created in older schema
  for (const c of columns) {
    if (c.pk) continue;
    let type = 'varchar';
    let lower = (c.type || '').toLowerCase();
    let nameLower = c.name.toLowerCase();
    if (nameLower === '_order' || nameLower === 'order' || nameLower === '_parent_id' || nameLower === 'parent_id' || nameLower.endsWith('_id') || nameLower === 'limit' || nameLower === 'order_num' || nameLower === 'quantity') {
      type = 'integer';
    } else if (lower.includes('int')) {
      type = 'integer';
    } else if (lower.includes('numeric') || lower.includes('real') || lower.includes('float') || nameLower.includes('price') || nameLower === 'views' || nameLower.endsWith('_width') || nameLower.endsWith('_height') || nameLower.endsWith('_filesize')) {
      type = 'numeric';
    } else if (lower.includes('json') || nameLower === 'content' || nameLower === 'data' || nameLower === 'items') {
      type = 'jsonb';
    } else if (nameLower.startsWith('is_') || nameLower.startsWith('auto_') || nameLower === 'featured' || nameLower === 'latest' || nameLower === 'autoplay' || nameLower === 'open_in_new_tab' || nameLower === 'primary_button_open_in_new_tab' || nameLower === 'secondary_button_open_in_new_tab') {
      type = 'boolean DEFAULT false';
    } else if (nameLower.endsWith('_at') || nameLower.endsWith('_date') || lower.includes('timestamp') || nameLower === 'expires_at' || nameLower === 'lock_until' || nameLower === 'reset_password_expiration') {
      type = 'timestamp(3) with time zone DEFAULT now()';
    }

    alterTableStatements.push(`DO $$ BEGIN ALTER TABLE "${tableName}" ADD COLUMN "${c.name}" ${type}; EXCEPTION WHEN duplicate_column THEN null; END $$;`);
  }
}

// Special fixes for tags & articles
alterTableStatements.push(`DO $$ BEGIN ALTER TABLE "tags" ADD COLUMN "title" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$;`);
alterTableStatements.push(`DO $$ BEGIN ALTER TABLE "tags" ADD COLUMN "name" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$;`);
alterTableStatements.push(`DO $$ BEGIN UPDATE "tags" SET "title" = "name" WHERE "title" IS NULL; EXCEPTION WHEN others THEN null; END $$;`);

fs.writeFileSync('./scripts/complete-schema.mjs', `// Generated complete schema for all 105 SQLite tables to PostgreSQL
export const ALL_TABLE_CREATES = ${JSON.stringify(createTableStatements, null, 2)};
export const ALL_COLUMN_ALTERS = ${JSON.stringify(alterTableStatements, null, 2)};
`);

console.log(`✅ Đã tạo scripts/complete-schema.mjs với ${createTableStatements.length} bảng và ${alterTableStatements.length} cột ALTER!`);

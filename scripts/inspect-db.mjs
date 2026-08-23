import Database from 'better-sqlite3';

const db = new Database('./payload-data.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

console.log('Tables found in payload-data.db:');
for (const { name } of tables) {
  const count = db.prepare(`SELECT count(*) as cnt FROM "${name}"`).get().cnt;
  if (count > 0) {
    console.log(`- ${name}: ${count} rows`);
  }
}

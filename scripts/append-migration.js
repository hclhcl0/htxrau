const fs = require('fs');
let data = fs.readFileSync('scripts/migrations.mjs', 'utf8');
const migration = `  ,
  // FIX: site_settings_menu_menu_items ID type change
  \`DO $$
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
  EXCEPTION WHEN others THEN
    null;
  END $$;\`
];`;

data = data.replace(/\];[\s\n]*$/, migration);
fs.writeFileSync('scripts/migrations.mjs', data);
console.log('Migration appended.');

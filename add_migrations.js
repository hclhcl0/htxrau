const fs = require('fs');
const path = 'scripts/migrations.mjs';
let content = fs.readFileSync(path, 'utf8');

const newBlock = `

  // ==================================================
  // BATCH: adSlider fields + slides table for latestNewsSection
  // ==================================================
  \`DO $$ BEGIN ALTER TABLE "site_settings_blocks_latest_news_section" ADD COLUMN IF NOT EXISTS "ad_slider_enabled" boolean DEFAULT false; EXCEPTION WHEN duplicate_column THEN null; END $$\`,
  \`DO $$ BEGIN ALTER TABLE "site_settings_blocks_latest_news_section" ADD COLUMN IF NOT EXISTS "ad_slider_title" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$\`,
  \`DO $$ BEGIN ALTER TABLE "site_settings_blocks_latest_news_section" ADD COLUMN IF NOT EXISTS "ad_slider_autoplay_interval" integer DEFAULT 5; EXCEPTION WHEN duplicate_column THEN null; END $$\`,
  \`CREATE TABLE IF NOT EXISTS "site_settings_blocks_latest_news_section_ad_slider_slides" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "image_id" integer, "link_url" varchar, "open_in_new_tab" boolean DEFAULT false, "alt_text" varchar)\`,
  \`DO $$ BEGIN ALTER TABLE "site_settings_blocks_latest_news_section_ad_slider_slides" ADD CONSTRAINT "ssbln_slides_img_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$\`,
  \`DO $$ BEGIN ALTER TABLE "site_settings_blocks_latest_news_section_ad_slider_slides" ADD CONSTRAINT "ssbln_slides_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_latest_news_section"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$\`,
  \`CREATE SEQUENCE IF NOT EXISTS "ssbln_ad_slider_slides_id_seq"\`,
  \`DO $$ BEGIN ALTER TABLE "site_settings_blocks_latest_news_section_ad_slider_slides" ALTER COLUMN "id" SET DEFAULT nextval('public.ssbln_ad_slider_slides_id_seq'::regclass); EXCEPTION WHEN others THEN null; END $$\`,
  \`CREATE INDEX IF NOT EXISTS "ssbln_slides_order_idx" ON "site_settings_blocks_latest_news_section_ad_slider_slides" USING btree ("_order")\`,
  \`CREATE INDEX IF NOT EXISTS "ssbln_slides_parent_idx" ON "site_settings_blocks_latest_news_section_ad_slider_slides" USING btree ("_parent_id")\``;

// Insert before closing ];
content = content.replace(/\n\];\s*$/, newBlock + '\n];');
fs.writeFileSync(path, content, 'utf8');
console.log('Done');

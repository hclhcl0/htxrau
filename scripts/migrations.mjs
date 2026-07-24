/**
 * MIGRATION STATEMENTS — nguồn duy nhất (single source of truth)
 * Cập nhật lúc: 11/06/2026 23:00
 *
 * Được dùng bởi:
 *   - migrate.mjs  (chạy tự động khi build trên Vercel: `node migrate.mjs && next build`)
 *
 * QUY TẮC:
 *   1. Luôn dùng IF NOT EXISTS / ADD COLUMN IF NOT EXISTS → an toàn khi chạy lại
 *   2. Khi thêm Collection/Global/Field mới → thêm SQL vào cuối danh sách này
 *   3. KHÔNG xóa các statement cũ (chỉ thêm mới)
 *   4. Sau khi thêm SQL → commit & push → Vercel sẽ tự apply khi build
 *
 * QUY TẮC ĐẶT TÊN BẢNG PAYLOAD CMS (drizzle-orm):
 *   Collection slug "my-items"     → "my_items"
 *   Array field "myItems.members"  → "my_items_members"
 *   Relationship field             → "my_items_rels"
 *   Global slug "my-settings"      → "my_settings"
 *   Versions của collection        → "_my_items_v"
 */

export const MIGRATION_STATEMENTS = [

  // ====================================================
  // BATCH: Add bannerHeight to multiBannerSection
  // ====================================================
  `
    DO \$\$ BEGIN ALTER TABLE "site_settings_blocks_multi_banner_section" ADD COLUMN "banner_height" integer; EXCEPTION WHEN duplicate_column THEN null; END \$\$;
    DO \$\$ BEGIN ALTER TABLE "settings_blocks_multi_banner_section" ADD COLUMN "banner_height" integer; EXCEPTION WHEN duplicate_column THEN null; END \$\$;
  `,


  
  
  
  // ====================================================
  // BATCH: ScheduleBlock tables for site_settings
  // ====================================================

  `
    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "icon" varchar,
      "highlight_box_show_highlight" boolean,
      "highlight_box_title" varchar,
      "bottom_note" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_order_idx" ON "site_settings_blocks_schedule_block" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_parent_id_idx" ON "site_settings_blocks_schedule_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_path_idx" ON "site_settings_blocks_schedule_block" ("_path");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block" ADD CONSTRAINT "site_settings_blocks_schedule_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "group_title" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_order_idx" ON "site_settings_blocks_schedule_block_schedule_groups" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_parent_id_idx" ON "site_settings_blocks_schedule_block_schedule_groups" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block_schedule_groups" ADD CONSTRAINT "site_settings_blocks_schedule_block_schedule_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_time_slots" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "time" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_time_slots_order_idx" ON "site_settings_blocks_schedule_block_schedule_groups_time_slots" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_schedule_groups_time_slots_parent_id_idx" ON "site_settings_blocks_schedule_block_schedule_groups_time_slots" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block_schedule_groups_time_slots" ADD CONSTRAINT "site_settings_blocks_schedule_block_schedule_groups_time_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_schedule_block_schedule_groups"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_schedule_block_highlight_box_content" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_highlight_box_content_order_idx" ON "site_settings_blocks_schedule_block_highlight_box_content" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_schedule_block_highlight_box_content_parent_id_idx" ON "site_settings_blocks_schedule_block_highlight_box_content" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_schedule_block_highlight_box_content" ADD CONSTRAINT "site_settings_blocks_schedule_block_highlight_box_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,

  // ====================================================
  // BATCH: MagazineBlock tables
  // ====================================================

  `
    CREATE TABLE IF NOT EXISTS "pages_blocks_magazine_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "description" varchar,
      "cover_image_id" integer NOT NULL,
      "pdf_file_id" integer,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_order_idx" ON "pages_blocks_magazine_block" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_parent_id_idx" ON "pages_blocks_magazine_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_path_idx" ON "pages_blocks_magazine_block" ("_path");
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block" ADD CONSTRAINT "pages_blocks_magazine_block_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block" ADD CONSTRAINT "pages_blocks_magazine_block_pdf_file_id_media_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block" ADD CONSTRAINT "pages_blocks_magazine_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "pages_blocks_magazine_block_magazine_pages" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "page_image_id" integer NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_magazine_pages_order_idx" ON "pages_blocks_magazine_block_magazine_pages" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_magazine_block_magazine_pages_parent_id_idx" ON "pages_blocks_magazine_block_magazine_pages" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "pages_blocks_magazine_block_magazine_pages_page_image_id_media_id_fk" FOREIGN KEY ("page_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "pages_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "pages_blocks_magazine_block_magazine_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_magazine_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,
  `
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_magazine_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "description" varchar,
      "cover_image_id" integer NOT NULL,
      "pdf_file_id" integer,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_order_idx" ON "_pages_v_blocks_magazine_block" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_parent_id_idx" ON "_pages_v_blocks_magazine_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_path_idx" ON "_pages_v_blocks_magazine_block" ("_path");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block" ADD CONSTRAINT "_pages_v_blocks_magazine_block_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block" ADD CONSTRAINT "_pages_v_blocks_magazine_block_pdf_file_id_media_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block" ADD CONSTRAINT "_pages_v_blocks_magazine_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_magazine_block_magazine_pages" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "page_image_id" integer NOT NULL,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_magazine_pages_order_idx" ON "_pages_v_blocks_magazine_block_magazine_pages" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_magazine_block_magazine_pages_parent_id_idx" ON "_pages_v_blocks_magazine_block_magazine_pages" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "_pages_v_blocks_magazine_block_magazine_pages_page_image_id_media_id_fk" FOREIGN KEY ("page_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "_pages_v_blocks_magazine_block_magazine_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_magazine_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,
  `
    CREATE TABLE IF NOT EXISTS "site_settings_blocks_magazine_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar,
      "description" varchar,
      "cover_image_id" integer NOT NULL,
      "pdf_file_id" integer,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_magazine_block_order_idx" ON "site_settings_blocks_magazine_block" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_magazine_block_parent_id_idx" ON "site_settings_blocks_magazine_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_magazine_block_path_idx" ON "site_settings_blocks_magazine_block" ("_path");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_magazine_block" ADD CONSTRAINT "site_settings_blocks_magazine_block_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_magazine_block" ADD CONSTRAINT "site_settings_blocks_magazine_block_pdf_file_id_media_id_fk" FOREIGN KEY ("pdf_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_magazine_block" ADD CONSTRAINT "site_settings_blocks_magazine_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "site_settings_blocks_magazine_block_magazine_pages" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "page_image_id" integer NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_magazine_block_magazine_pages_order_idx" ON "site_settings_blocks_magazine_block_magazine_pages" ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_blocks_magazine_block_magazine_pages_parent_id_idx" ON "site_settings_blocks_magazine_block_magazine_pages" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "site_settings_blocks_magazine_block_magazine_pages_page_image_id_media_id_fk" FOREIGN KEY ("page_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "site_settings_blocks_magazine_block_magazine_pages" ADD CONSTRAINT "site_settings_blocks_magazine_block_magazine_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_blocks_magazine_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,

  // ====================================================
  // BATCH: ScheduleBlock tables
  // ====================================================

  `
    CREATE TABLE IF NOT EXISTS "pages_blocks_schedule_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "icon" varchar,
      "highlight_box_show_highlight" boolean,
      "highlight_box_title" varchar,
      "bottom_note" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_order_idx" ON "pages_blocks_schedule_block" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_parent_id_idx" ON "pages_blocks_schedule_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_path_idx" ON "pages_blocks_schedule_block" ("_path");
    
    DO $$ BEGIN ALTER TABLE "pages_blocks_schedule_block" ADD CONSTRAINT "pages_blocks_schedule_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "pages_blocks_schedule_block_schedule_groups" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "group_title" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_schedule_groups_order_idx" ON "pages_blocks_schedule_block_schedule_groups" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_schedule_groups_parent_id_idx" ON "pages_blocks_schedule_block_schedule_groups" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "pages_blocks_schedule_block_schedule_groups" ADD CONSTRAINT "pages_blocks_schedule_block_schedule_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "pages_blocks_schedule_block_schedule_groups_time_slots" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "time" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_schedule_groups_time_slots_order_idx" ON "pages_blocks_schedule_block_schedule_groups_time_slots" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_schedule_groups_time_slots_parent_id_idx" ON "pages_blocks_schedule_block_schedule_groups_time_slots" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "pages_blocks_schedule_block_schedule_groups_time_slots" ADD CONSTRAINT "pages_blocks_schedule_block_schedule_groups_time_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_schedule_block_schedule_groups"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "pages_blocks_schedule_block_highlight_box_content" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_highlight_box_content_order_idx" ON "pages_blocks_schedule_block_highlight_box_content" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_schedule_block_highlight_box_content_parent_id_idx" ON "pages_blocks_schedule_block_highlight_box_content" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "pages_blocks_schedule_block_highlight_box_content" ADD CONSTRAINT "pages_blocks_schedule_block_highlight_box_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,

  `
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_schedule_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "icon" varchar,
      "highlight_box_show_highlight" boolean,
      "highlight_box_title" varchar,
      "bottom_note" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_order_idx" ON "_pages_v_blocks_schedule_block" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_parent_id_idx" ON "_pages_v_blocks_schedule_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_path_idx" ON "_pages_v_blocks_schedule_block" ("_path");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_schedule_block" ADD CONSTRAINT "_pages_v_blocks_schedule_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_schedule_block_schedule_groups" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "group_title" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_schedule_groups_order_idx" ON "_pages_v_blocks_schedule_block_schedule_groups" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_schedule_groups_parent_id_idx" ON "_pages_v_blocks_schedule_block_schedule_groups" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_schedule_block_schedule_groups" ADD CONSTRAINT "_pages_v_blocks_schedule_block_schedule_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_schedule_block_schedule_groups_time_slots" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar,
      "time" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_schedule_groups_time_slots_order_idx" ON "_pages_v_blocks_schedule_block_schedule_groups_time_slots" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_schedule_groups_time_slots_parent_id_idx" ON "_pages_v_blocks_schedule_block_schedule_groups_time_slots" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_schedule_block_schedule_groups_time_slots" ADD CONSTRAINT "_pages_v_blocks_schedule_block_schedule_groups_time_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_schedule_block_schedule_groups"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_schedule_block_highlight_box_content" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "text" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_highlight_box_content_order_idx" ON "_pages_v_blocks_schedule_block_highlight_box_content" ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_schedule_block_highlight_box_content_parent_id_idx" ON "_pages_v_blocks_schedule_block_highlight_box_content" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "_pages_v_blocks_schedule_block_highlight_box_content" ADD CONSTRAINT "_pages_v_blocks_schedule_block_highlight_box_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,

  `
    CREATE TABLE IF NOT EXISTS "settings_blocks_schedule_block" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "icon" varchar,
      "highlight_box_show_highlight" boolean,
      "highlight_box_title" varchar,
      "bottom_note" varchar,
      "block_name" varchar
    );
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_order_idx" ON "settings_blocks_schedule_block" ("_order");
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_parent_id_idx" ON "settings_blocks_schedule_block" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_path_idx" ON "settings_blocks_schedule_block" ("_path");
    DO $$ BEGIN ALTER TABLE "settings_blocks_schedule_block" ADD CONSTRAINT "settings_blocks_schedule_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "settings_blocks_schedule_block_schedule_groups" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "group_title" varchar
    );
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_schedule_groups_order_idx" ON "settings_blocks_schedule_block_schedule_groups" ("_order");
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_schedule_groups_parent_id_idx" ON "settings_blocks_schedule_block_schedule_groups" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "settings_blocks_schedule_block_schedule_groups" ADD CONSTRAINT "settings_blocks_schedule_block_schedule_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "settings_blocks_schedule_block_schedule_groups_time_slots" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "time" varchar
    );
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_schedule_groups_time_slots_order_idx" ON "settings_blocks_schedule_block_schedule_groups_time_slots" ("_order");
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_schedule_groups_time_slots_parent_id_idx" ON "settings_blocks_schedule_block_schedule_groups_time_slots" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "settings_blocks_schedule_block_schedule_groups_time_slots" ADD CONSTRAINT "settings_blocks_schedule_block_schedule_groups_time_slots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_blocks_schedule_block_schedule_groups"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "settings_blocks_schedule_block_highlight_box_content" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar
    );
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_highlight_box_content_order_idx" ON "settings_blocks_schedule_block_highlight_box_content" ("_order");
    CREATE INDEX IF NOT EXISTS "settings_blocks_schedule_block_highlight_box_content_parent_id_idx" ON "settings_blocks_schedule_block_highlight_box_content" ("_parent_id");
    DO $$ BEGIN ALTER TABLE "settings_blocks_schedule_block_highlight_box_content" ADD CONSTRAINT "settings_blocks_schedule_block_highlight_box_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_blocks_schedule_block"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
  `,

  // ====================================================
  // BATCH 1 – Settings: sidebarWidgets blocks
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "settings_blocks_categories_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Chuyên mục',
    "limit" numeric DEFAULT 10,
    CONSTRAINT "settings_blocks_categories_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_categories_widget_order_idx" ON "settings_blocks_categories_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_categories_widget_parent_idx" ON "settings_blocks_categories_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_categories_widget_path_idx" ON "settings_blocks_categories_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_recent_articles_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Tin mới cập nhật',
    "limit" numeric DEFAULT 5,
    CONSTRAINT "settings_blocks_recent_articles_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_recent_articles_widget_order_idx" ON "settings_blocks_recent_articles_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_recent_articles_widget_parent_idx" ON "settings_blocks_recent_articles_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_recent_articles_widget_path_idx" ON "settings_blocks_recent_articles_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_tiktok_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Kênh TikTok CDC',
    "channel_id" integer,
    CONSTRAINT "settings_blocks_tiktok_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_widget_order_idx" ON "settings_blocks_tiktok_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_widget_parent_idx" ON "settings_blocks_tiktok_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_widget_path_idx" ON "settings_blocks_tiktok_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_facebook_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Fanpage CDC',
    "page_url" varchar NOT NULL DEFAULT 'https://www.facebook.com/cdcdanang',
    "height" numeric DEFAULT 350,
    CONSTRAINT "settings_blocks_facebook_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_facebook_widget_order_idx" ON "settings_blocks_facebook_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_facebook_widget_parent_idx" ON "settings_blocks_facebook_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_facebook_widget_path_idx" ON "settings_blocks_facebook_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_banner_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "image_id" integer,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT true,
    CONSTRAINT "settings_blocks_banner_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_widget_order_idx" ON "settings_blocks_banner_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_widget_parent_idx" ON "settings_blocks_banner_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_widget_path_idx" ON "settings_blocks_banner_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_custom_html_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "html_content" text NOT NULL,
    CONSTRAINT "settings_blocks_custom_html_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_custom_html_widget_order_idx" ON "settings_blocks_custom_html_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_custom_html_widget_parent_idx" ON "settings_blocks_custom_html_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_custom_html_widget_path_idx" ON "settings_blocks_custom_html_widget" USING btree ("_path")`,

  // ====================================================
  // BATCH 2 – main_menu global
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "main_menu" (
    "id" serial PRIMARY KEY NOT NULL,
    "menu_position" varchar DEFAULT 'top',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "main_menu_menu_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "main_menu_menu_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "main_menu" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_order_idx" ON "main_menu_menu_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_parent_idx" ON "main_menu_menu_items" USING btree ("_parent_id")`,
  `CREATE TABLE IF NOT EXISTS "main_menu_menu_items_sub_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "main_menu_menu_items_sub_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "main_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_sub_items_order_idx" ON "main_menu_menu_items_sub_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "main_menu_menu_items_sub_items_parent_idx" ON "main_menu_menu_items_sub_items" USING btree ("_parent_id")`,

  // ====================================================
  // BATCH 2b – settings table: missing columns
  // ====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "home_news_layout" varchar DEFAULT 'grid'`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "theme_config_font_family" varchar DEFAULT 'Inter'`,

  // ====================================================
  // BATCH 3 – settings homeSections blocks
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "settings_blocks_news_category_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "category_id" integer,
    "limit" numeric DEFAULT 2,
    "layout" varchar DEFAULT 'grid',
    CONSTRAINT "settings_blocks_news_category_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_order_idx" ON "settings_blocks_news_category_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_parent_idx" ON "settings_blocks_news_category_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_news_category_section_path_idx" ON "settings_blocks_news_category_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_banner_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "image_id" integer,
    "title" varchar,
    "subtitle" varchar,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "style" varchar DEFAULT 'fullwidth',
    CONSTRAINT "settings_blocks_banner_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_section_order_idx" ON "settings_blocks_banner_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_section_parent_idx" ON "settings_blocks_banner_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_banner_section_path_idx" ON "settings_blocks_banner_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_multi_banner_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "columns" numeric DEFAULT 4,
    CONSTRAINT "settings_blocks_multi_banner_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_multi_banner_section_order_idx" ON "settings_blocks_multi_banner_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_multi_banner_section_parent_idx" ON "settings_blocks_multi_banner_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_multi_banner_section_path_idx" ON "settings_blocks_multi_banner_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_multi_banner_section_banners" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "image_id" integer,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT true,
    CONSTRAINT "settings_blocks_multi_banner_section_banners_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings_blocks_multi_banner_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_multi_banner_section_banners_order_idx" ON "settings_blocks_multi_banner_section_banners" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_multi_banner_section_banners_parent_idx" ON "settings_blocks_multi_banner_section_banners" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_video_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'VIDEO NỔI BẬT',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    "layout" varchar DEFAULT 'grid',
    CONSTRAINT "settings_blocks_video_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_order_idx" ON "settings_blocks_video_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_parent_idx" ON "settings_blocks_video_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_path_idx" ON "settings_blocks_video_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_video_section_channels" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "channel_id" integer NOT NULL,
    CONSTRAINT "settings_blocks_video_section_channels_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings_blocks_video_section" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "settings_blocks_video_section_channels_channel_fk"
      FOREIGN KEY ("channel_id") REFERENCES "video_channels" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_channels_order_idx" ON "settings_blocks_video_section_channels" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_channels_parent_idx" ON "settings_blocks_video_section_channels" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_video_section_channels_channel_idx" ON "settings_blocks_video_section_channels" USING btree ("channel_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_tiktok_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'KENH TIKTOK CDC DA NANG',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    CONSTRAINT "settings_blocks_tiktok_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_order_idx" ON "settings_blocks_tiktok_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_parent_idx" ON "settings_blocks_tiktok_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_tiktok_section_path_idx" ON "settings_blocks_tiktok_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_stats_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "background_color" varchar DEFAULT 'primary',
    CONSTRAINT "settings_blocks_stats_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_order_idx" ON "settings_blocks_stats_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_parent_idx" ON "settings_blocks_stats_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_path_idx" ON "settings_blocks_stats_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_stats_section_stats" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🏥',
    "value" varchar NOT NULL,
    "label" varchar NOT NULL,
    "suffix" varchar,
    CONSTRAINT "settings_blocks_stats_section_stats_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings_blocks_stats_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_stats_order_idx" ON "settings_blocks_stats_section_stats" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_stats_section_stats_parent_idx" ON "settings_blocks_stats_section_stats" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_quick_links_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'DICH VU TRUC TUYEN',
    CONSTRAINT "settings_blocks_quick_links_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_order_idx" ON "settings_blocks_quick_links_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_parent_idx" ON "settings_blocks_quick_links_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_path_idx" ON "settings_blocks_quick_links_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_quick_links_section_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🔗',
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT true,
    "color" varchar DEFAULT 'primary',
    CONSTRAINT "settings_blocks_quick_links_section_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings_blocks_quick_links_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_links_order_idx" ON "settings_blocks_quick_links_section_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_quick_links_section_links_parent_idx" ON "settings_blocks_quick_links_section_links" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_blocks_rich_text_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "content" jsonb,
    CONSTRAINT "settings_blocks_rich_text_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_rich_text_section_order_idx" ON "settings_blocks_rich_text_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_rich_text_section_parent_idx" ON "settings_blocks_rich_text_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_rich_text_section_path_idx" ON "settings_blocks_rich_text_section" USING btree ("_path")`,

  // ====================================================
  // BATCH 4 – form_submissions collection
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "form_submissions" (
    "id" serial PRIMARY KEY NOT NULL,
    "status" varchar DEFAULT 'new',
    "subject" varchar NOT NULL,
    "name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "phone" varchar,
    "organization" varchar,
    "message" text NOT NULL,
    "admin_note" text,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at")`,

  // ====================================================
  // BATCH 5 – pages: new columns + Page Builder blocks
  // ====================================================
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "page_type" varchar DEFAULT 'standard'`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout" varchar DEFAULT 'withSidebar'`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_title" varchar`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_description" text`,
  `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "seo_og_image_id" integer`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_rich_text_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "content" jsonb,
    CONSTRAINT "pages_blocks_rich_text_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_order_idx" ON "pages_blocks_rich_text_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_parent_idx" ON "pages_blocks_rich_text_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_rich_text_block_path_idx" ON "pages_blocks_rich_text_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_section_title_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL,
    "subtitle" varchar,
    "level" varchar DEFAULT 'h2',
    "alignment" varchar DEFAULT 'left',
    "style" varchar DEFAULT 'underline',
    CONSTRAINT "pages_blocks_section_title_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_block_order_idx" ON "pages_blocks_section_title_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_block_parent_idx" ON "pages_blocks_section_title_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_section_title_block_path_idx" ON "pages_blocks_section_title_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_card_grid_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "columns" varchar DEFAULT '3',
    "card_style" varchar DEFAULT 'shadow',
    CONSTRAINT "pages_blocks_card_grid_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_order_idx" ON "pages_blocks_card_grid_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_parent_idx" ON "pages_blocks_card_grid_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_path_idx" ON "pages_blocks_card_grid_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_card_grid_block_cards" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar,
    "image_id" integer,
    "title" varchar NOT NULL,
    "description" text,
    "link_url" varchar,
    "link_label" varchar DEFAULT 'Xem them',
    "highlight" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_card_grid_block_cards_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_card_grid_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_cards_order_idx" ON "pages_blocks_card_grid_block_cards" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_grid_block_cards_parent_idx" ON "pages_blocks_card_grid_block_cards" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_steps_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "layout" varchar DEFAULT 'vertical',
    CONSTRAINT "pages_blocks_steps_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_order_idx" ON "pages_blocks_steps_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_parent_idx" ON "pages_blocks_steps_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_path_idx" ON "pages_blocks_steps_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_steps_block_steps" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar,
    "title" varchar NOT NULL,
    "description" text,
    "note" varchar,
    CONSTRAINT "pages_blocks_steps_block_steps_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_steps_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_steps_order_idx" ON "pages_blocks_steps_block_steps" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_steps_block_steps_parent_idx" ON "pages_blocks_steps_block_steps" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_faq_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Cau hoi thuong gap',
    CONSTRAINT "pages_blocks_faq_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_order_idx" ON "pages_blocks_faq_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_parent_idx" ON "pages_blocks_faq_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_path_idx" ON "pages_blocks_faq_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_faq_block_faqs" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "question" varchar NOT NULL,
    "answer" text NOT NULL,
    CONSTRAINT "pages_blocks_faq_block_faqs_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_faq_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_faqs_order_idx" ON "pages_blocks_faq_block_faqs" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_faq_block_faqs_parent_idx" ON "pages_blocks_faq_block_faqs" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_divider_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "style" varchar DEFAULT 'line',
    "size" varchar DEFAULT 'md',
    CONSTRAINT "pages_blocks_divider_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_divider_block_order_idx" ON "pages_blocks_divider_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_divider_block_parent_idx" ON "pages_blocks_divider_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_divider_block_path_idx" ON "pages_blocks_divider_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_cta_banner_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL,
    "description" text,
    "style" varchar DEFAULT 'primary',
    "background_image_id" integer,
    "primary_button_label" varchar DEFAULT 'Tim hieu them',
    "primary_button_url" varchar,
    "primary_button_open_in_new_tab" boolean DEFAULT false,
    "secondary_button_label" varchar,
    "secondary_button_url" varchar,
    "secondary_button_open_in_new_tab" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_cta_banner_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_cta_banner_block_order_idx" ON "pages_blocks_cta_banner_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_cta_banner_block_parent_idx" ON "pages_blocks_cta_banner_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_cta_banner_block_path_idx" ON "pages_blocks_cta_banner_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_embed_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "embed_type" varchar DEFAULT 'custom',
    "html_code" text,
    "google_maps_url" varchar,
    "facebook_url" varchar,
    "height" numeric DEFAULT 400,
    CONSTRAINT "pages_blocks_embed_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_embed_block_order_idx" ON "pages_blocks_embed_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_embed_block_parent_idx" ON "pages_blocks_embed_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_embed_block_path_idx" ON "pages_blocks_embed_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "caption" varchar,
    "striped" boolean DEFAULT true,
    "bordered" boolean DEFAULT true,
    CONSTRAINT "pages_blocks_table_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_order_idx" ON "pages_blocks_table_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_parent_idx" ON "pages_blocks_table_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_path_idx" ON "pages_blocks_table_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block_headers" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar NOT NULL,
    "align" varchar DEFAULT 'left',
    CONSTRAINT "pages_blocks_table_block_headers_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_table_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_headers_order_idx" ON "pages_blocks_table_block_headers" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_headers_parent_idx" ON "pages_blocks_table_block_headers" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block_rows" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    CONSTRAINT "pages_blocks_table_block_rows_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_table_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_order_idx" ON "pages_blocks_table_block_rows" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_parent_idx" ON "pages_blocks_table_block_rows" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_table_block_rows_cells" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "content" varchar NOT NULL,
    "highlight" boolean DEFAULT false,
    CONSTRAINT "pages_blocks_table_block_rows_cells_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_table_block_rows" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_cells_order_idx" ON "pages_blocks_table_block_rows_cells" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_table_block_rows_cells_parent_idx" ON "pages_blocks_table_block_rows_cells" USING btree ("_parent_id")`,

  // ====================================================
  // BATCH 6 – video_channels + videos
  // ====================================================
  `DO $$ BEGIN
    CREATE TYPE "enum_video_channels_platform" AS ENUM('youtube', 'facebook', 'tiktok');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,

  `CREATE TABLE IF NOT EXISTS "video_channels" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "platform" "enum_video_channels_platform" NOT NULL,
    "channel_url" varchar,
    "channel_id" varchar,
    "avatar_id" integer,
    "description" varchar,
    "tiktok_handle" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "video_channels_avatar_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "video_channels_avatar_idx" ON "video_channels" USING btree ("avatar_id")`,
  `CREATE INDEX IF NOT EXISTS "video_channels_updated_at_idx" ON "video_channels" USING btree ("updated_at")`,
  `CREATE INDEX IF NOT EXISTS "video_channels_created_at_idx" ON "video_channels" USING btree ("created_at")`,

  `ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "channel_id" integer`,
  `ALTER TABLE "videos" DROP CONSTRAINT IF EXISTS "videos_channel_id_fk"`,
  `ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "video_channels"("id") ON DELETE set null ON UPDATE no action`,
  `CREATE INDEX IF NOT EXISTS "videos_channel_idx" ON "videos" USING btree ("channel_id")`,

  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "video_channels_id" integer`,
  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "form_submissions_id" integer`,
  `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_video_channels_fk"`,
  `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_channels_fk" FOREIGN KEY ("video_channels_id") REFERENCES "video_channels"("id") ON DELETE cascade ON UPDATE no action`,
  `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_form_submissions_fk"`,
  `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "form_submissions"("id") ON DELETE cascade ON UPDATE no action`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_video_channels_id_idx" ON "payload_locked_documents_rels" USING btree ("video_channels_id")`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id")`,

  // ====================================================
  // BATCH 7 – users: sessions + rels + new columns
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now(),
    "expires_at" timestamp(3) with time zone
  )`,
  `CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "users_sessions_parent_idx" ON "users_sessions" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "users_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
    "path" varchar NOT NULL,
    "categories_id" integer REFERENCES "categories"("id") ON DELETE cascade
  )`,
  `CREATE INDEX IF NOT EXISTS "users_rels_order_idx" ON "users_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "users_rels_path_idx" ON "users_rels" USING btree ("path")`,

  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar`,

  // ====================================================
  // BATCH 8 – articles: missing columns
  // ====================================================
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "review_status" varchar DEFAULT 'draft'`,
  `ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_review_status" varchar DEFAULT 'draft'`,
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "author_name" varchar`,
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "views" numeric DEFAULT 0`,

  // ====================================================
  // BATCH 9 – org_units collection
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "org_units" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "unit_type" varchar DEFAULT 'khoa' NOT NULL,
    "order" numeric DEFAULT 99,
    "short_description" varchar,
    "phone" varchar,
    "email" varchar,
    "image_id" integer REFERENCES "media"("id") ON DELETE set null,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "org_units" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 99`,
  `ALTER TABLE "org_units" ADD COLUMN IF NOT EXISTS "short_description" varchar`,
  `ALTER TABLE "org_units" ADD COLUMN IF NOT EXISTS "phone" varchar`,
  `ALTER TABLE "org_units" ADD COLUMN IF NOT EXISTS "email" varchar`,
  `ALTER TABLE "org_units" ADD COLUMN IF NOT EXISTS "image_id" integer`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'org_units_image_id_fk') THEN ALTER TABLE "org_units" ADD CONSTRAINT "org_units_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;`,
  `CREATE INDEX IF NOT EXISTS "org_units_created_at_idx" ON "org_units" USING btree ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "org_units_members" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "org_units"("id") ON DELETE cascade,
    "id" varchar PRIMARY KEY NOT NULL,
    "member_name" varchar NOT NULL,
    "position" varchar DEFAULT 'nhan_vien' NOT NULL,
    "academic_title" varchar,
    "email" varchar,
    "avatar_id" integer REFERENCES "media"("id") ON DELETE set null,
    "bio" varchar
  )`,
  `ALTER TABLE "org_units_members" ADD COLUMN IF NOT EXISTS "academic_title" varchar`,
  `ALTER TABLE "org_units_members" ADD COLUMN IF NOT EXISTS "email" varchar`,
  `ALTER TABLE "org_units_members" ADD COLUMN IF NOT EXISTS "avatar_id" integer`,
  `ALTER TABLE "org_units_members" ADD COLUMN IF NOT EXISTS "bio" varchar`,
  `CREATE INDEX IF NOT EXISTS "org_units_members_order_idx" ON "org_units_members" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "org_units_members_parent_id_idx" ON "org_units_members" USING btree ("_parent_id")`,

  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "org_units_id" integer`,
  `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_org_units_fk"`,
  `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_org_units_fk" FOREIGN KEY ("org_units_id") REFERENCES "org_units"("id") ON DELETE cascade ON UPDATE no action`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_org_units_id_idx" ON "payload_locked_documents_rels" USING btree ("org_units_id")`,

  // ====================================================
  // BATCH 10 – theme_settings global
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "theme_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "primary_color" varchar DEFAULT '#006C5B',
    "secondary_color" varchar DEFAULT '#004F45',
    "accent_color" varchar DEFAULT '#00A651',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 11 – theme_settings: thêm cột org_colors_*
  // Payload CMS tạo tên cột theo pattern: {groupSlug}_{fieldName}
  // group 'orgColors' + field 'ban_lanh_dao' → 'org_colors_ban_lanh_dao'
  // ====================================================
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_ban_lanh_dao" varchar DEFAULT '#0d47a1'`,
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_phong" varchar DEFAULT '#2e7d32'`,
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_khoa" varchar DEFAULT '#1976d2'`,
  `ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "org_colors_khac" varchar DEFAULT '#e65100'`,

  // ====================================================
  // BATCH 12 – ai_settings global
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "ai_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "chat_enabled" boolean DEFAULT true,
    "gemini_api_keys" text,
    "chat_welcome_message" varchar DEFAULT 'Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?',
    "chat_custom_prompt" text,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 13 – Add aiChatSettings columns to settings table + department to users
  // ====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_enabled" boolean DEFAULT true`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_gemini_api_keys" text`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_welcome_message" varchar DEFAULT 'Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?'`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_custom_prompt" text`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department" varchar`,

  // ====================================================
  // BATCH 14 – Add auto_zalo_broadcast to articles table
  // ====================================================
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "auto_zalo_broadcast" boolean DEFAULT false`,
  `ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_auto_zalo_broadcast" boolean DEFAULT false`,

  // ====================================================
  // BATCH 15 – Documents: thêm trường hiệu lực, lĩnh vực, người ký
  // ====================================================
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "effective_date" timestamp(3) with time zone`,
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "expiry_date" timestamp(3) with time zone`,
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "field" varchar`,
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "signer" varchar`,

  // ====================================================
  // BATCH 16 – Tạo bảng procurements (Thông tin mua sắm)
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "procurements" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "document_number" varchar,
    "procurement_type" varchar NOT NULL DEFAULT 'thu-moi-chao-gia',
    "status" varchar NOT NULL DEFAULT 'open',
    "published_date" timestamp(3) with time zone NOT NULL,
    "deadline" timestamp(3) with time zone,
    "file_id" integer,
    "note" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "procurements_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "procurements_published_date_idx" ON "procurements" USING btree ("published_date")`,
  `CREATE INDEX IF NOT EXISTS "procurements_status_idx" ON "procurements" USING btree ("status")`,
  `CREATE INDEX IF NOT EXISTS "procurements_created_at_idx" ON "procurements" USING btree ("created_at")`,

  // ====================================================
  // BATCH 17 – Thêm cột drive_url (Google Drive link)
  // ====================================================
  `ALTER TABLE "procurements" ADD COLUMN IF NOT EXISTS "drive_url" varchar`,
  `ALTER TABLE "documents"    ADD COLUMN IF NOT EXISTS "drive_url" varchar`,

  // ====================================================
  // BATCH 18 – Thêm cột thumbnail_id cho procurements (ảnh đại diện lưới)
  // ====================================================
  `ALTER TABLE "procurements" ADD COLUMN IF NOT EXISTS "thumbnail_id" integer`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'procurements_thumbnail_id_fk') THEN
      ALTER TABLE "procurements" ADD CONSTRAINT "procurements_thumbnail_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;`,

  // ====================================================
  // BATCH 19 – Tạo bảng procedure_groups
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "procedure_groups" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar,
    "order" numeric,
    "icon" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 20 – Tạo bảng procedures
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "procedures" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "group_id" integer,
    "status" varchar DEFAULT 'active',
    "published_date" timestamp(3) with time zone NOT NULL,
    "implementation_time" varchar,
    "fee" varchar,
    "result" varchar,
    "requirements" jsonb,
    "file_id" integer,
    "drive_url" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "procedures_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "procedure_groups" ("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT "procedures_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "procedures_group_id_idx" ON "procedures" USING btree ("group_id")`,
  `CREATE INDEX IF NOT EXISTS "procedures_published_date_idx" ON "procedures" USING btree ("published_date")`,
  `CREATE INDEX IF NOT EXISTS "procedures_status_idx" ON "procedures" USING btree ("status")`,

  // ====================================================
  // BATCH 21 – Tạo bảng service_categories
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar,
    "order" numeric,
    "description" varchar,
    "icon" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,

  // ====================================================
  // BATCH 22 – Tạo bảng services
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "services" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "category_id" integer,
    "status" varchar DEFAULT 'active',
    "price" varchar,
    "short_description" varchar,
    "content" jsonb,
    "thumbnail_id" integer,
    "booking_url" varchar,
    "contact_phone" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "services_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "service_categories" ("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT "services_thumbnail_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "services_status_idx" ON "services" USING btree ("status")`,

  // ====================================================
  // BATCH 23 – Tạo bảng Global services_landing
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "services_landing" (
    "id" serial PRIMARY KEY NOT NULL,
    "hero_title" varchar,
    "hero_subtitle" varchar,
    "hero_background_image_id" integer,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  )`,
  `CREATE TABLE IF NOT EXISTS "services_landing_features" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    "icon" varchar,
    CONSTRAINT "services_landing_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "services_landing" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE TABLE IF NOT EXISTS "services_landing_process" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    CONSTRAINT "services_landing_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "services_landing" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE TABLE IF NOT EXISTS "services_landing_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    CONSTRAINT "services_landing_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "services_landing" ("id") ON DELETE cascade ON UPDATE no action
  )`,

  // ====================================================
  // BATCH 24 – Cập nhật Payload system rels cho các bảng mới (procurements, procedure_groups, procedures, service_categories, services)
  // ====================================================
  ...['procurements', 'procedure_groups', 'procedures', 'service_categories', 'services'].flatMap(table => [
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "${table}_id" integer`,
    `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_${table}_fk"`,
    `ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_${table}_fk" FOREIGN KEY ("${table}_id") REFERENCES "${table}"("id") ON DELETE cascade ON UPDATE no action`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_${table}_id_idx" ON "payload_locked_documents_rels" USING btree ("${table}_id")`,

    `ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "${table}_id" integer`,
    `ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_${table}_fk"`,
    `ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_${table}_fk" FOREIGN KEY ("${table}_id") REFERENCES "${table}"("id") ON DELETE cascade ON UPDATE no action`,
    `CREATE INDEX IF NOT EXISTS "payload_preferences_rels_${table}_id_idx" ON "payload_preferences_rels" USING btree ("${table}_id")`
  ]),

  // ====================================================
  // BATCH 25 – Thêm trường icon, color, order_num vào categories
  // ====================================================
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "icon" varchar`,
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "color" varchar`,
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "order_num" numeric DEFAULT 0`,

  // ====================================================
  // BATCH 26 – Thêm group articleReaderTools vào settings
  // ====================================================
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_font_size" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_t_t_s" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_f_b" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_zalo" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_google_news" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_google_news_url" varchar`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_copy_link" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_print" boolean`,
  `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_read_progress" boolean`,

  // ====================================================
  // BATCH 27 – Thêm Collection departments + liên kết vào users
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "departments" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "code" varchar,
    "type" varchar DEFAULT 'phong' NOT NULL,
    "description" varchar,
    "sort_order" numeric DEFAULT 0,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "departments_code_idx" ON "departments" USING btree ("code")`,
  `CREATE INDEX IF NOT EXISTS "departments_created_at_idx" ON "departments" USING btree ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "departments_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "categories_id" integer,
    CONSTRAINT "departments_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "departments" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "departments_rels_categories_fk"
      FOREIGN KEY ("categories_id") REFERENCES "categories" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "departments_rels_order_idx" ON "departments_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "departments_rels_parent_idx" ON "departments_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "departments_rels_path_idx" ON "departments_rels" USING btree ("path")`,

  // Thêm cột department_id vào bảng users (liên kết đến departments)
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department_id" integer`,
  `ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fk"
    FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE set null ON UPDATE no action`,
  // ====================================================
  // BATCH 22 – Site Settings
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "header_site_name" varchar NOT NULL DEFAULT 'Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng',
    "header_logo_id" integer,
    "header_logo_customization_logo_height" numeric DEFAULT 80,
    "header_logo_customization_logo_position" varchar DEFAULT 'left',
    "header_logo_customization_show_site_name" boolean DEFAULT true,
    "header_logo_customization_site_name_line1" varchar DEFAULT 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
    "header_logo_customization_site_name_line2" varchar DEFAULT 'THÀNH PHỐ ĐÀ NẴNG',
    "header_logo_customization_site_tagline" varchar DEFAULT 'Phòng bệnh chủ động-vươn rộng tương lai',
    "header_logo_customization_logo_banner_image_id" integer,
    "header_logo_customization_mobile_logo_id" integer,
    "header_logo_customization_mobile_logo_height" numeric DEFAULT 40,
    "header_logo_customization_logo_hover_effect" varchar DEFAULT 'bounce',
    "header_logo_customization_mobile_show_site_name" boolean DEFAULT false,
    "header_search_customization_position" varchar DEFAULT 'navbar',
    "header_search_customization_style" varchar DEFAULT 'popup',
    "header_search_customization_width" numeric DEFAULT 250,
    "header_hotline_phone" varchar DEFAULT '0236 3890 407',
    "header_hotline_action_link" varchar DEFAULT '#',
    "header_hotline_position" varchar DEFAULT 'topbar',
    "header_social_links_facebook" varchar,
    "header_social_links_youtube" varchar,
    "header_social_links_twitter" varchar,
    "header_social_links_instagram" varchar,
    "menu_menu_position" varchar DEFAULT 'below',
    "sidebar_width_ratio" varchar DEFAULT 'Sidebar 33% - Main 67%',
    "sidebar_gap_size" varchar DEFAULT 'Vừa',
    "footer_about_text" varchar,
    "footer_address_main" varchar,
    "footer_address_sub" varchar,
    "footer_phone" varchar,
    "footer_email" varchar,
    "footer_copyright_text" varchar DEFAULT '© Bản quyền thuộc về TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG',
    "footer_designer_credit" varchar DEFAULT 'thiết kế bởi CNTT CDC Đà Nẵng',
    "theme_org_layout" varchar DEFAULT 'chart_accordion',
    "theme_org_colors_ban_lanh_dao" varchar DEFAULT '#0d47a1',
    "theme_org_colors_phong" varchar DEFAULT '#2e7d32',
    "theme_org_colors_khoa" varchar DEFAULT '#1976d2',
    "theme_org_colors_khac" varchar DEFAULT '#e65100',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "site_settings_header_logo_id_fk" FOREIGN KEY ("header_logo_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT "site_settings_header_logo_customization_logo_banner_image_id_fk" FOREIGN KEY ("header_logo_customization_logo_banner_image_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT "site_settings_header_logo_customization_mobile_logo_id_fk" FOREIGN KEY ("header_logo_customization_mobile_logo_id") REFERENCES "media" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE TABLE IF NOT EXISTS "site_settings_menu_menu_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar,
    CONSTRAINT "site_settings_menu_menu_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_order_idx" ON "site_settings_menu_menu_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_parent_idx" ON "site_settings_menu_menu_items" USING btree ("_parent_id")`,
  
  `CREATE TABLE IF NOT EXISTS "site_settings_menu_menu_items_sub_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    CONSTRAINT "site_settings_menu_menu_items_sub_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_sub_items_order_idx" ON "site_settings_menu_menu_items_sub_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_sub_items_parent_idx" ON "site_settings_menu_menu_items_sub_items" USING btree ("_parent_id")`,
  
  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_category_news" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL,
    "category_info_id" integer NOT NULL,
    "limit" numeric DEFAULT 4,
    CONSTRAINT "site_settings_blocks_category_news_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "site_settings_blocks_category_news_category_info_id_fk" 
      FOREIGN KEY ("category_info_id") REFERENCES "categories" ("id") ON DELETE set null ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_category_news_order_idx" ON "site_settings_blocks_category_news" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_category_news_parent_idx" ON "site_settings_blocks_category_news" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_category_news_path_idx" ON "site_settings_blocks_category_news" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_footer_quick_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    CONSTRAINT "site_settings_footer_quick_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_quick_links_order_idx" ON "site_settings_footer_quick_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_quick_links_parent_idx" ON "site_settings_footer_quick_links" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_footer_social_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "platform" varchar NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    CONSTRAINT "site_settings_footer_social_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_social_links_order_idx" ON "site_settings_footer_social_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_social_links_parent_idx" ON "site_settings_footer_social_links" USING btree ("_parent_id")`,

  // ====================================================
  // BATCH X – Add DocumentSigners Collection and relationship in Documents
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "document_signers" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "position" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "document_signers" ADD COLUMN IF NOT EXISTS "position" varchar`,
  `CREATE INDEX IF NOT EXISTS "document_signers_updated_at_idx" ON "document_signers" USING btree ("updated_at")`,
  `CREATE INDEX IF NOT EXISTS "document_signers_created_at_idx" ON "document_signers" USING btree ("created_at")`,
  
  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "signer_ref_id" integer`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_signer_ref_id_fk') THEN
      ALTER TABLE "documents" ADD CONSTRAINT "documents_signer_ref_id_fk" FOREIGN KEY ("signer_ref_id") REFERENCES "document_signers"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "documents_signer_ref_id_idx" ON "documents" USING btree ("signer_ref_id")`,

  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "document_signers_id" integer`,
  `DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_signers_fk" FOREIGN KEY ("document_signers_id") REFERENCES "document_signers"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_document_signers_id_idx" ON "payload_locked_documents_rels" USING btree ("document_signers_id")`,

  // ====================================================
  // BATCH X - SiteSettings: theme fields
  // ====================================================
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_layout" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_ban_lanh_dao" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_phong" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_khoa" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_khac" varchar`,

  // ====================================================
  // BATCH X - SiteSettings: menu fields
  // ====================================================
  `ALTER TABLE "site_settings_menu_menu_items" ADD COLUMN IF NOT EXISTS "preset_url" varchar`,
  `ALTER TABLE "site_settings_menu_menu_items" ADD COLUMN IF NOT EXISTS "open_in_new_tab" boolean`,
  `ALTER TABLE "site_settings_menu_menu_items_sub_items" ADD COLUMN IF NOT EXISTS "preset_url" varchar`,
  `ALTER TABLE "site_settings_menu_menu_items_sub_items" ADD COLUMN IF NOT EXISTS "open_in_new_tab" boolean`,

  // ====================================================
  // BATCH X - AI Knowledge & API Keys
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "ai_knowledge" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "category" varchar NOT NULL,
    "extraction_model" varchar,
    "content" varchar,
    "embedding" varchar,
    "uploaded_by_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `DO $$ BEGIN
    ALTER TABLE "ai_knowledge" ADD CONSTRAINT "ai_knowledge_uploaded_by_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_uploaded_by_id_idx" ON "ai_knowledge" USING btree ("uploaded_by_id")`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_updated_at_idx" ON "ai_knowledge" USING btree ("updated_at")`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_created_at_idx" ON "ai_knowledge" USING btree ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "ai_knowledge_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "departments_id" integer
  )`,
  `DO $$ BEGIN
    ALTER TABLE "ai_knowledge_rels" ADD CONSTRAINT "ai_knowledge_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "ai_knowledge"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "ai_knowledge_rels" ADD CONSTRAINT "ai_knowledge_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_rels_order_idx" ON "ai_knowledge_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_rels_parent_idx" ON "ai_knowledge_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_rels_path_idx" ON "ai_knowledge_rels" USING btree ("path")`,
  `CREATE INDEX IF NOT EXISTS "ai_knowledge_rels_departments_id_idx" ON "ai_knowledge_rels" USING btree ("departments_id")`,

  `CREATE TABLE IF NOT EXISTS "api_keys" (
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "provider" varchar NOT NULL,
    "api_key" varchar NOT NULL,
    "is_active" boolean,
    "supported_models" varchar,
    "preferred_model" varchar,
    "usage_tokens" double precision,
    "usage_count" double precision,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "api_keys_updated_at_idx" ON "api_keys" USING btree ("updated_at")`,
  `CREATE INDEX IF NOT EXISTS "api_keys_created_at_idx" ON "api_keys" USING btree ("created_at")`,

  ...['ai_knowledge', 'api_keys'].flatMap(table => [
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "${table}_id" integer`,
    `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_${table}_fk" FOREIGN KEY ("${table}_id") REFERENCES "${table}"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_${table}_id_idx" ON "payload_locked_documents_rels" USING btree ("${table}_id")`,

    `ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "${table}_id" integer`,
    `DO $$ BEGIN ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_${table}_fk" FOREIGN KEY ("${table}_id") REFERENCES "${table}"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `CREATE INDEX IF NOT EXISTS "payload_preferences_rels_${table}_id_idx" ON "payload_preferences_rels" USING btree ("${table}_id")`
  ]),

  // ====================================================
  // BATCH X - Missing Page Blocks
  // ====================================================
  `ALTER TABLE "pages_rels" ADD COLUMN IF NOT EXISTS "articles_id" integer`,
  `DO $$ BEGIN ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE INDEX IF NOT EXISTS "pages_rels_articles_id_idx" ON "pages_rels" USING btree ("articles_id")`,

  `CREATE TABLE IF NOT EXISTS "pages_blocks_audio_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "title" varchar,
    "source_type" varchar,
    "audio_file_id" integer,
    "audio_url" varchar,
    "description" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_audio_block_order_idx" ON "pages_blocks_audio_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_audio_block_parent_idx" ON "pages_blocks_audio_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_audio_block_path_idx" ON "pages_blocks_audio_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_button_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" varchar,
    "open_in_new_tab" boolean,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_button_block_order_idx" ON "pages_blocks_button_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_button_block_parent_idx" ON "pages_blocks_button_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_button_block_path_idx" ON "pages_blocks_button_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_callout_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "type" varchar,
    "title" varchar,
    "content" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_callout_block_order_idx" ON "pages_blocks_callout_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_callout_block_parent_idx" ON "pages_blocks_callout_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_callout_block_path_idx" ON "pages_blocks_callout_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_card_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "image_id" integer,
    "title" varchar,
    "description" varchar,
    "link_url" varchar,
    "link_label" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_block_order_idx" ON "pages_blocks_card_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_block_parent_idx" ON "pages_blocks_card_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_card_block_path_idx" ON "pages_blocks_card_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_category_news" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "title" varchar,
    "category_info_id" integer,
    "limit" double precision,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_category_news_order_idx" ON "pages_blocks_category_news" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_category_news_parent_idx" ON "pages_blocks_category_news" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_category_news_path_idx" ON "pages_blocks_category_news" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_columns_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "layout" varchar,
    "col1" varchar,
    "col2" varchar,
    "col3" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_columns_block_order_idx" ON "pages_blocks_columns_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_columns_block_parent_idx" ON "pages_blocks_columns_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_columns_block_path_idx" ON "pages_blocks_columns_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_file_downloads_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "title" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_file_downloads_block_order_idx" ON "pages_blocks_file_downloads_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_file_downloads_block_parent_idx" ON "pages_blocks_file_downloads_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_file_downloads_block_path_idx" ON "pages_blocks_file_downloads_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_file_downloads_block_files" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "file_id" integer,
    "custom_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_file_downloads_block_files_order_idx" ON "pages_blocks_file_downloads_block_files" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_file_downloads_block_files_parent_idx" ON "pages_blocks_file_downloads_block_files" USING btree ("_parent_id")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "style" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_block_order_idx" ON "pages_blocks_gallery_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_block_parent_idx" ON "pages_blocks_gallery_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_block_path_idx" ON "pages_blocks_gallery_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_block_images" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "image_id" integer,
    "caption" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_block_images_order_idx" ON "pages_blocks_gallery_block_images" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_gallery_block_images_parent_idx" ON "pages_blocks_gallery_block_images" USING btree ("_parent_id")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_hero_banner" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "title" varchar,
    "description" varchar,
    "link" varchar,
    "tag" varchar,
    "image_id" integer,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_hero_banner_order_idx" ON "pages_blocks_hero_banner" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_hero_banner_parent_idx" ON "pages_blocks_hero_banner" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_hero_banner_path_idx" ON "pages_blocks_hero_banner" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_infographic_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_infographic_block_order_idx" ON "pages_blocks_infographic_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_infographic_block_parent_idx" ON "pages_blocks_infographic_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_infographic_block_path_idx" ON "pages_blocks_infographic_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_livestream_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "title" varchar,
    "platform" varchar,
    "video_id" varchar,
    "status" varchar,
    "description" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_livestream_block_order_idx" ON "pages_blocks_livestream_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_livestream_block_parent_idx" ON "pages_blocks_livestream_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_livestream_block_path_idx" ON "pages_blocks_livestream_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_pdf_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "source" varchar,
    "pdf_file_id" integer,
    "gdrive_url" varchar,
    "display_mode" varchar,
    "caption" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_pdf_block_order_idx" ON "pages_blocks_pdf_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_pdf_block_parent_idx" ON "pages_blocks_pdf_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_pdf_block_path_idx" ON "pages_blocks_pdf_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_quote_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "quote" varchar,
    "author" varchar,
    "role" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_quote_block_order_idx" ON "pages_blocks_quote_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_quote_block_parent_idx" ON "pages_blocks_quote_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_quote_block_path_idx" ON "pages_blocks_quote_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_related_articles_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "title" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_related_articles_block_order_idx" ON "pages_blocks_related_articles_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_related_articles_block_parent_idx" ON "pages_blocks_related_articles_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_related_articles_block_path_idx" ON "pages_blocks_related_articles_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_slider_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "autoplay" boolean,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_slider_block_order_idx" ON "pages_blocks_slider_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_slider_block_parent_idx" ON "pages_blocks_slider_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_slider_block_path_idx" ON "pages_blocks_slider_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_slider_block_images" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "image_id" integer,
    "caption" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_slider_block_images_order_idx" ON "pages_blocks_slider_block_images" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_slider_block_images_parent_idx" ON "pages_blocks_slider_block_images" USING btree ("_parent_id")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_tiktok_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "video_id" varchar,
    "video_url" varchar,
    "max_width" double precision,
    "alignment" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_tiktok_block_order_idx" ON "pages_blocks_tiktok_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_tiktok_block_parent_idx" ON "pages_blocks_tiktok_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_tiktok_block_path_idx" ON "pages_blocks_tiktok_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_video_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "platform" varchar,
    "video_url" varchar,
    "embed_code" varchar,
    "caption" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_order_idx" ON "pages_blocks_video_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_parent_idx" ON "pages_blocks_video_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_video_block_path_idx" ON "pages_blocks_video_block" USING btree ("_path")`,
  `CREATE TABLE IF NOT EXISTS "pages_blocks_zalo_widget_block" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" varchar NOT NULL,
    "oa_id" varchar,
    "title" varchar,
    "widget_type" varchar,
    "block_name" varchar
  )`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_zalo_widget_block_order_idx" ON "pages_blocks_zalo_widget_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_zalo_widget_block_parent_idx" ON "pages_blocks_zalo_widget_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "pages_blocks_zalo_widget_block_path_idx" ON "pages_blocks_zalo_widget_block" USING btree ("_path")`,

  // ====================================================
  // BATCH X – _pages_v versioned tables (required for versions: { drafts: true })
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "_pages_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_page_type" varchar DEFAULT 'standard',
    "version_layout" varchar DEFAULT 'withSidebar',
    "version_seo_title" varchar,
    "version_seo_description" text,
    "version_seo_og_image_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" varchar DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  )`,
  `DO $$ BEGIN ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_parent_id_idx" ON "_pages_v" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_version_slug_idx" ON "_pages_v" USING btree ("version_slug")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest")`,
  `ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "autosave" boolean`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_rich_text_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "content" jsonb,
    CONSTRAINT "_pages_v_blocks_rich_text_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_block_order_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_block_parent_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_rich_text_block_path_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_section_title_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "subtitle" varchar,
    "level" varchar DEFAULT 'h2',
    "alignment" varchar DEFAULT 'left',
    "style" varchar DEFAULT 'underline',
    CONSTRAINT "_pages_v_blocks_section_title_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_title_block_order_idx" ON "_pages_v_blocks_section_title_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_title_block_parent_idx" ON "_pages_v_blocks_section_title_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_section_title_block_path_idx" ON "_pages_v_blocks_section_title_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_callout_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "type" varchar,
    "title" varchar,
    "content" varchar,
    CONSTRAINT "_pages_v_blocks_callout_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_callout_block_order_idx" ON "_pages_v_blocks_callout_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_callout_block_parent_idx" ON "_pages_v_blocks_callout_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_callout_block_path_idx" ON "_pages_v_blocks_callout_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_columns_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "layout" varchar,
    "col1" varchar,
    "col2" varchar,
    "col3" varchar,
    CONSTRAINT "_pages_v_blocks_columns_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_columns_block_order_idx" ON "_pages_v_blocks_columns_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_columns_block_parent_idx" ON "_pages_v_blocks_columns_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_columns_block_path_idx" ON "_pages_v_blocks_columns_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_divider_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "style" varchar DEFAULT 'line',
    "size" varchar DEFAULT 'md',
    CONSTRAINT "_pages_v_blocks_divider_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_divider_block_order_idx" ON "_pages_v_blocks_divider_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_divider_block_parent_idx" ON "_pages_v_blocks_divider_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_divider_block_path_idx" ON "_pages_v_blocks_divider_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_card_grid_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "columns" varchar DEFAULT '3',
    "card_style" varchar DEFAULT 'shadow',
    CONSTRAINT "_pages_v_blocks_card_grid_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_block_order_idx" ON "_pages_v_blocks_card_grid_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_block_parent_idx" ON "_pages_v_blocks_card_grid_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_block_path_idx" ON "_pages_v_blocks_card_grid_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_card_grid_block_cards" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "icon" varchar,
    "image_id" integer,
    "title" varchar,
    "description" text,
    "link_url" varchar,
    "link_label" varchar,
    "highlight" boolean DEFAULT false,
    CONSTRAINT "_pages_v_blocks_card_grid_block_cards_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_card_grid_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_block_cards_order_idx" ON "_pages_v_blocks_card_grid_block_cards" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_grid_block_cards_parent_idx" ON "_pages_v_blocks_card_grid_block_cards" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_card_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "image_id" integer,
    "title" varchar,
    "description" varchar,
    "link_url" varchar,
    "link_label" varchar,
    CONSTRAINT "_pages_v_blocks_card_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_block_order_idx" ON "_pages_v_blocks_card_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_block_parent_idx" ON "_pages_v_blocks_card_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_card_block_path_idx" ON "_pages_v_blocks_card_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_steps_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "layout" varchar DEFAULT 'vertical',
    CONSTRAINT "_pages_v_blocks_steps_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_block_order_idx" ON "_pages_v_blocks_steps_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_block_parent_idx" ON "_pages_v_blocks_steps_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_block_path_idx" ON "_pages_v_blocks_steps_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_steps_block_steps" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "icon" varchar,
    "title" varchar,
    "description" text,
    "note" varchar,
    CONSTRAINT "_pages_v_blocks_steps_block_steps_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_steps_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_block_steps_order_idx" ON "_pages_v_blocks_steps_block_steps" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_steps_block_steps_parent_idx" ON "_pages_v_blocks_steps_block_steps" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_faq_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    CONSTRAINT "_pages_v_blocks_faq_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_block_order_idx" ON "_pages_v_blocks_faq_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_block_parent_idx" ON "_pages_v_blocks_faq_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_block_path_idx" ON "_pages_v_blocks_faq_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_faq_block_faqs" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "question" varchar,
    "answer" text,
    CONSTRAINT "_pages_v_blocks_faq_block_faqs_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_faq_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_block_faqs_order_idx" ON "_pages_v_blocks_faq_block_faqs" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_faq_block_faqs_parent_idx" ON "_pages_v_blocks_faq_block_faqs" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_button_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "label" varchar,
    "url" varchar,
    "style" varchar,
    "open_in_new_tab" boolean,
    CONSTRAINT "_pages_v_blocks_button_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_button_block_order_idx" ON "_pages_v_blocks_button_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_button_block_parent_idx" ON "_pages_v_blocks_button_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_button_block_path_idx" ON "_pages_v_blocks_button_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_cta_banner_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "description" text,
    "style" varchar DEFAULT 'primary',
    "background_image_id" integer,
    "primary_button_label" varchar,
    "primary_button_url" varchar,
    "primary_button_open_in_new_tab" boolean DEFAULT false,
    "secondary_button_label" varchar,
    "secondary_button_url" varchar,
    "secondary_button_open_in_new_tab" boolean DEFAULT false,
    CONSTRAINT "_pages_v_blocks_cta_banner_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cta_banner_block_order_idx" ON "_pages_v_blocks_cta_banner_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cta_banner_block_parent_idx" ON "_pages_v_blocks_cta_banner_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_cta_banner_block_path_idx" ON "_pages_v_blocks_cta_banner_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_video_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "platform" varchar,
    "video_url" varchar,
    "embed_code" varchar,
    "caption" varchar,
    CONSTRAINT "_pages_v_blocks_video_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_order_idx" ON "_pages_v_blocks_video_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_parent_idx" ON "_pages_v_blocks_video_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_video_block_path_idx" ON "_pages_v_blocks_video_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_tiktok_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "video_id" varchar,
    "video_url" varchar,
    "max_width" double precision,
    "alignment" varchar,
    CONSTRAINT "_pages_v_blocks_tiktok_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_tiktok_block_order_idx" ON "_pages_v_blocks_tiktok_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_tiktok_block_parent_idx" ON "_pages_v_blocks_tiktok_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_tiktok_block_path_idx" ON "_pages_v_blocks_tiktok_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "style" varchar,
    CONSTRAINT "_pages_v_blocks_gallery_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_block_order_idx" ON "_pages_v_blocks_gallery_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_block_parent_idx" ON "_pages_v_blocks_gallery_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_block_path_idx" ON "_pages_v_blocks_gallery_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery_block_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "image_id" integer,
    "caption" varchar,
    CONSTRAINT "_pages_v_blocks_gallery_block_images_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_gallery_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_block_images_order_idx" ON "_pages_v_blocks_gallery_block_images" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_gallery_block_images_parent_idx" ON "_pages_v_blocks_gallery_block_images" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_pdf_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "source" varchar,
    "pdf_file_id" integer,
    "gdrive_url" varchar,
    "display_mode" varchar,
    "caption" varchar,
    CONSTRAINT "_pages_v_blocks_pdf_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pdf_block_order_idx" ON "_pages_v_blocks_pdf_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pdf_block_parent_idx" ON "_pages_v_blocks_pdf_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_pdf_block_path_idx" ON "_pages_v_blocks_pdf_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_embed_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "embed_type" varchar DEFAULT 'custom',
    "html_code" text,
    "google_maps_url" varchar,
    "facebook_url" varchar,
    "height" numeric DEFAULT 400,
    CONSTRAINT "_pages_v_blocks_embed_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_embed_block_order_idx" ON "_pages_v_blocks_embed_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_embed_block_parent_idx" ON "_pages_v_blocks_embed_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_embed_block_path_idx" ON "_pages_v_blocks_embed_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_table_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "caption" varchar,
    "striped" boolean DEFAULT true,
    "bordered" boolean DEFAULT true,
    CONSTRAINT "_pages_v_blocks_table_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_order_idx" ON "_pages_v_blocks_table_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_parent_idx" ON "_pages_v_blocks_table_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_path_idx" ON "_pages_v_blocks_table_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_table_block_headers" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "label" varchar,
    "align" varchar DEFAULT 'left',
    CONSTRAINT "_pages_v_blocks_table_block_headers_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_table_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_headers_order_idx" ON "_pages_v_blocks_table_block_headers" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_headers_parent_idx" ON "_pages_v_blocks_table_block_headers" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_table_block_rows" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    CONSTRAINT "_pages_v_blocks_table_block_rows_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_table_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_rows_order_idx" ON "_pages_v_blocks_table_block_rows" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_rows_parent_idx" ON "_pages_v_blocks_table_block_rows" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_table_block_rows_cells" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "content" varchar,
    "highlight" boolean DEFAULT false,
    CONSTRAINT "_pages_v_blocks_table_block_rows_cells_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_table_block_rows" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_rows_cells_order_idx" ON "_pages_v_blocks_table_block_rows_cells" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_table_block_rows_cells_parent_idx" ON "_pages_v_blocks_table_block_rows_cells" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_related_articles_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    CONSTRAINT "_pages_v_blocks_related_articles_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_related_articles_block_order_idx" ON "_pages_v_blocks_related_articles_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_related_articles_block_parent_idx" ON "_pages_v_blocks_related_articles_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_related_articles_block_path_idx" ON "_pages_v_blocks_related_articles_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_category_news" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "category_info_id" integer,
    "limit" double precision,
    CONSTRAINT "_pages_v_blocks_category_news_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_category_news_order_idx" ON "_pages_v_blocks_category_news" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_category_news_parent_idx" ON "_pages_v_blocks_category_news" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_category_news_path_idx" ON "_pages_v_blocks_category_news" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_quote_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "quote" varchar,
    "author" varchar,
    "role" varchar,
    CONSTRAINT "_pages_v_blocks_quote_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quote_block_order_idx" ON "_pages_v_blocks_quote_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quote_block_parent_idx" ON "_pages_v_blocks_quote_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_quote_block_path_idx" ON "_pages_v_blocks_quote_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_audio_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    "source_type" varchar,
    "audio_file_id" integer,
    "audio_url" varchar,
    "description" varchar,
    CONSTRAINT "_pages_v_blocks_audio_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_audio_block_order_idx" ON "_pages_v_blocks_audio_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_audio_block_parent_idx" ON "_pages_v_blocks_audio_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_audio_block_path_idx" ON "_pages_v_blocks_audio_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_file_downloads_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "title" varchar,
    CONSTRAINT "_pages_v_blocks_file_downloads_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_file_downloads_block_order_idx" ON "_pages_v_blocks_file_downloads_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_file_downloads_block_parent_idx" ON "_pages_v_blocks_file_downloads_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_file_downloads_block_path_idx" ON "_pages_v_blocks_file_downloads_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_file_downloads_block_files" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "file_id" integer,
    "custom_name" varchar,
    CONSTRAINT "_pages_v_blocks_file_downloads_block_files_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_file_downloads_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_file_downloads_block_files_order_idx" ON "_pages_v_blocks_file_downloads_block_files" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_file_downloads_block_files_parent_idx" ON "_pages_v_blocks_file_downloads_block_files" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_slider_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "autoplay" boolean,
    CONSTRAINT "_pages_v_blocks_slider_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_slider_block_order_idx" ON "_pages_v_blocks_slider_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_slider_block_parent_idx" ON "_pages_v_blocks_slider_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_slider_block_path_idx" ON "_pages_v_blocks_slider_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_slider_block_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_uuid" varchar,
    "image_id" integer,
    "caption" varchar,
    CONSTRAINT "_pages_v_blocks_slider_block_images_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_slider_block" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_slider_block_images_order_idx" ON "_pages_v_blocks_slider_block_images" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_slider_block_images_parent_idx" ON "_pages_v_blocks_slider_block_images" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_infographic_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "_uuid" varchar,
    "image_id" integer,
    "caption" varchar,
    CONSTRAINT "_pages_v_blocks_infographic_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_infographic_block_order_idx" ON "_pages_v_blocks_infographic_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_infographic_block_parent_idx" ON "_pages_v_blocks_infographic_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_infographic_block_path_idx" ON "_pages_v_blocks_infographic_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_zalo_widget_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "oa_id" varchar,
    "title" varchar,
    "widget_type" varchar,
    CONSTRAINT "_pages_v_blocks_zalo_widget_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_zalo_widget_block_order_idx" ON "_pages_v_blocks_zalo_widget_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_zalo_widget_block_parent_idx" ON "_pages_v_blocks_zalo_widget_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_zalo_widget_block_path_idx" ON "_pages_v_blocks_zalo_widget_block" USING btree ("_path")`,


  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_livestream_block" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "platform" varchar,
    "video_id" varchar,
    "status" varchar,
    "description" varchar,
    CONSTRAINT "_pages_v_blocks_livestream_block_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_livestream_block_order_idx" ON "_pages_v_blocks_livestream_block" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_livestream_block_parent_idx" ON "_pages_v_blocks_livestream_block" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_livestream_block_path_idx" ON "_pages_v_blocks_livestream_block" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_hero_banner" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "description" varchar,
    "link" varchar,
    "tag" varchar,
    "image_id" integer,
    CONSTRAINT "_pages_v_blocks_hero_banner_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_banner_order_idx" ON "_pages_v_blocks_hero_banner" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_banner_parent_idx" ON "_pages_v_blocks_hero_banner" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_banner_path_idx" ON "_pages_v_blocks_hero_banner" USING btree ("_path")`,

  // _pages_v_rels for relationships used in _pages_v (seo og image, etc.)
  `CREATE TABLE IF NOT EXISTS "_pages_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "media_id" integer,
    "articles_id" integer,
    "categories_id" integer,
    CONSTRAINT "_pages_v_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "_pages_v" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "_pages_v_rels_pages_fk"
      FOREIGN KEY ("pages_id") REFERENCES "pages" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "_pages_v_rels_media_fk"
      FOREIGN KEY ("media_id") REFERENCES "media" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "_pages_v_rels_articles_fk"
      FOREIGN KEY ("articles_id") REFERENCES "articles" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "_pages_v_rels_categories_fk"
      FOREIGN KEY ("categories_id") REFERENCES "categories" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path")`,

  // payload_locked_documents_rels for _pages_v (needed so admin can lock versions)
  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "_pages_v_id" integer`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels__pages_v_fk" FOREIGN KEY ("_pages_v_id") REFERENCES "_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels__pages_v_id_idx" ON "payload_locked_documents_rels" USING btree ("_pages_v_id")`,


  // ====================================================
  // BATCH X - Fix ID types for arrays and blocks
  // ====================================================
  ...[
    "settings_blocks_categories_widget",
    "settings_blocks_recent_articles_widget",
    "settings_blocks_tiktok_widget",
    "settings_blocks_facebook_widget",
    "settings_blocks_banner_widget",
    "settings_blocks_custom_html_widget",
    "main_menu_menu_items",
    "main_menu_menu_items_sub_items",
    "settings_blocks_news_category_section",
    "settings_blocks_multi_banner_section_banners",
    "settings_blocks_multi_banner_section",
    "settings_blocks_banner_section",
    "settings_blocks_video_section",
    "settings_blocks_tiktok_section",
    "settings_blocks_stats_section",
    "settings_blocks_stats_section_stats",
    "settings_blocks_quick_links_section",
    "settings_blocks_quick_links_section_links",
    "settings_blocks_rich_text_section",
    "pages_blocks_rich_text_block",
    "pages_blocks_section_title_block",
    "pages_blocks_card_grid_block",
    "pages_blocks_card_grid_block_cards",
    "pages_blocks_steps_block",
    "pages_blocks_steps_block_steps",
    "pages_blocks_faq_block",
    "pages_blocks_faq_block_faqs",
    "pages_blocks_divider_block",
    "pages_blocks_cta_banner_block",
    "pages_blocks_embed_block",
    "pages_blocks_table_block",
    "pages_blocks_table_block_headers",
    "pages_blocks_table_block_rows",
    "pages_blocks_table_block_rows_cells",
    "org_units_members",
    "services_landing_features",
    "services_landing_process",
    "services_landing_faq",
    "site_settings_menu_menu_items",
    "site_settings_menu_menu_items_sub_items",
    "site_settings_blocks_category_news",
    "site_settings_footer_quick_links",
    "site_settings_footer_social_links"
  ].flatMap(table => [
    `DO $$ BEGIN ALTER TABLE "${table}" ALTER COLUMN "id" DROP DEFAULT; EXCEPTION WHEN others THEN null; END $$;`,
    `DO $$ BEGIN ALTER TABLE "${table}" ALTER COLUMN "id" TYPE varchar USING "id"::varchar; EXCEPTION WHEN others THEN null; END $$;`
  ]),

  // ====================================================
  // BATCH X+1 – Add _uuid column to all _pages_v_blocks_* tables
  // Payload CMS requires a _uuid column in every versioned block table
  // ====================================================
  ...[
    "_pages_v_blocks_rich_text_block",
    "_pages_v_blocks_section_title_block",
    "_pages_v_blocks_callout_block",
    "_pages_v_blocks_columns_block",
    "_pages_v_blocks_divider_block",
    "_pages_v_blocks_card_grid_block",
    "_pages_v_blocks_card_grid_block_cards",
    "_pages_v_blocks_card_block",
    "_pages_v_blocks_steps_block",
    "_pages_v_blocks_steps_block_steps",
    "_pages_v_blocks_faq_block",
    "_pages_v_blocks_faq_block_faqs",
    "_pages_v_blocks_button_block",
    "_pages_v_blocks_cta_banner_block",
    "_pages_v_blocks_video_block",
    "_pages_v_blocks_tiktok_block",
    "_pages_v_blocks_gallery_block",
    "_pages_v_blocks_gallery_block_images",
    "_pages_v_blocks_pdf_block",
    "_pages_v_blocks_embed_block",
    "_pages_v_blocks_table_block",
    "_pages_v_blocks_table_block_headers",
    "_pages_v_blocks_table_block_rows",
    "_pages_v_blocks_table_block_rows_cells",
    "_pages_v_blocks_related_articles_block",
    "_pages_v_blocks_category_news",
    "_pages_v_blocks_quote_block",
    "_pages_v_blocks_audio_block",
    "_pages_v_blocks_file_downloads_block",
    "_pages_v_blocks_file_downloads_block_files",
    "_pages_v_blocks_slider_block",
    "_pages_v_blocks_slider_block_images",
    "_pages_v_blocks_infographic_block",
    "_pages_v_blocks_zalo_widget_block",
    "_pages_v_blocks_livestream_block",
    "_pages_v_blocks_hero_banner"
  ].map(table =>
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "_uuid" varchar`
  ),

  // Also add _uuid to pages_blocks_* tables in the newer batch (added without _uuid)
  ...[
    "pages_blocks_audio_block",
    "pages_blocks_button_block",
    "pages_blocks_callout_block",
    "pages_blocks_card_block",
    "pages_blocks_category_news",
    "pages_blocks_columns_block",
    "pages_blocks_file_downloads_block",
    "pages_blocks_file_downloads_block_files",
    "pages_blocks_gallery_block",
    "pages_blocks_gallery_block_images",
    "pages_blocks_hero_banner",
    "pages_blocks_infographic_block",
    "pages_blocks_livestream_block",
    "pages_blocks_pdf_block",
    "pages_blocks_quote_block",
    "pages_blocks_related_articles_block",
    "pages_blocks_slider_block",
    "pages_blocks_slider_block_images",
    "pages_blocks_tiktok_block",
    "pages_blocks_video_block",
    "pages_blocks_zalo_widget_block"
  ].map(table =>
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "_uuid" varchar`
  ),

  // ====================================================
  // BATCH 25 - Add site_settings blocks (Migrated from Settings)
  // ====================================================
  
  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_categories_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Chuyên mục',
    "limit" numeric DEFAULT 10,
    CONSTRAINT "site_settings_blocks_categories_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_categories_widget_order_idx" ON "site_settings_blocks_categories_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_categories_widget_parent_idx" ON "site_settings_blocks_categories_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_categories_widget_path_idx" ON "site_settings_blocks_categories_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_recent_articles_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar NOT NULL DEFAULT 'Tin mới cập nhật',
    "limit" numeric DEFAULT 5,
    CONSTRAINT "site_settings_blocks_recent_articles_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_recent_articles_widget_order_idx" ON "site_settings_blocks_recent_articles_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_recent_articles_widget_parent_idx" ON "site_settings_blocks_recent_articles_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_recent_articles_widget_path_idx" ON "site_settings_blocks_recent_articles_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_tiktok_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Kênh TikTok CDC',
    "channel_id" integer,
    CONSTRAINT "site_settings_blocks_tiktok_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_tiktok_widget_order_idx" ON "site_settings_blocks_tiktok_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_tiktok_widget_parent_idx" ON "site_settings_blocks_tiktok_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_tiktok_widget_path_idx" ON "site_settings_blocks_tiktok_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_facebook_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Fanpage CDC',
    "page_url" varchar NOT NULL DEFAULT 'https://www.facebook.com/cdcdanang',
    "height" numeric DEFAULT 350,
    CONSTRAINT "site_settings_blocks_facebook_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_facebook_widget_order_idx" ON "site_settings_blocks_facebook_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_facebook_widget_parent_idx" ON "site_settings_blocks_facebook_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_facebook_widget_path_idx" ON "site_settings_blocks_facebook_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_banner_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "image_id" integer,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT true,
    CONSTRAINT "site_settings_blocks_banner_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_banner_widget_order_idx" ON "site_settings_blocks_banner_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_banner_widget_parent_idx" ON "site_settings_blocks_banner_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_banner_widget_path_idx" ON "site_settings_blocks_banner_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_custom_html_widget" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "html_content" text NOT NULL,
    CONSTRAINT "site_settings_blocks_custom_html_widget_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_custom_html_widget_order_idx" ON "site_settings_blocks_custom_html_widget" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_custom_html_widget_parent_idx" ON "site_settings_blocks_custom_html_widget" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_custom_html_widget_path_idx" ON "site_settings_blocks_custom_html_widget" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_news_category_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "category_id" integer,
    "limit" numeric DEFAULT 2,
    "layout" varchar DEFAULT 'grid',
    CONSTRAINT "site_settings_blocks_news_category_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_news_category_section_order_idx" ON "site_settings_blocks_news_category_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_news_category_section_parent_idx" ON "site_settings_blocks_news_category_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_news_category_section_path_idx" ON "site_settings_blocks_news_category_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_banner_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "image_id" integer,
    "title" varchar,
    "subtitle" varchar,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "style" varchar DEFAULT 'fullwidth',
    CONSTRAINT "site_settings_blocks_banner_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_banner_section_order_idx" ON "site_settings_blocks_banner_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_banner_section_parent_idx" ON "site_settings_blocks_banner_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_banner_section_path_idx" ON "site_settings_blocks_banner_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_multi_banner_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "columns" numeric DEFAULT 4,
    CONSTRAINT "site_settings_blocks_multi_banner_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_multi_banner_section_order_idx" ON "site_settings_blocks_multi_banner_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_multi_banner_section_parent_idx" ON "site_settings_blocks_multi_banner_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_multi_banner_section_path_idx" ON "site_settings_blocks_multi_banner_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_multi_banner_section_banners" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer NOT NULL,
    "link_url" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    CONSTRAINT "site_settings_blocks_multi_banner_section_banners_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_blocks_multi_banner_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_multi_banner_section_banners_order_idx" ON "site_settings_blocks_multi_banner_section_banners" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_multi_banner_section_banners_parent_idx" ON "site_settings_blocks_multi_banner_section_banners" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_video_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'VIDEO NỔI BẬT',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    "layout" varchar DEFAULT 'grid',
    CONSTRAINT "site_settings_blocks_video_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_video_section_order_idx" ON "site_settings_blocks_video_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_video_section_parent_idx" ON "site_settings_blocks_video_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_video_section_path_idx" ON "site_settings_blocks_video_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_video_section_channels" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "channel_id" integer NOT NULL,
    CONSTRAINT "site_settings_blocks_video_section_channels_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_blocks_video_section" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "site_settings_blocks_video_section_channels_channel_fk"
      FOREIGN KEY ("channel_id") REFERENCES "video_channels" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_video_section_channels_order_idx" ON "site_settings_blocks_video_section_channels" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_video_section_channels_parent_idx" ON "site_settings_blocks_video_section_channels" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_video_section_channels_channel_idx" ON "site_settings_blocks_video_section_channels" USING btree ("channel_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_tiktok_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'KENH TIKTOK CDC DA NANG',
    "channel_id" integer,
    "limit" numeric DEFAULT 4,
    CONSTRAINT "site_settings_blocks_tiktok_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_tiktok_section_order_idx" ON "site_settings_blocks_tiktok_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_tiktok_section_parent_idx" ON "site_settings_blocks_tiktok_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_tiktok_section_path_idx" ON "site_settings_blocks_tiktok_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_stats_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "background_color" varchar DEFAULT 'primary',
    CONSTRAINT "site_settings_blocks_stats_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_order_idx" ON "site_settings_blocks_stats_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_parent_idx" ON "site_settings_blocks_stats_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_path_idx" ON "site_settings_blocks_stats_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_quick_links_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'DICH VU TRUC TUYEN',
    CONSTRAINT "site_settings_blocks_quick_links_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_order_idx" ON "site_settings_blocks_quick_links_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_parent_idx" ON "site_settings_blocks_quick_links_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_path_idx" ON "site_settings_blocks_quick_links_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_rich_text_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "content" jsonb,
    CONSTRAINT "site_settings_blocks_rich_text_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_rich_text_section_order_idx" ON "site_settings_blocks_rich_text_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_rich_text_section_parent_idx" ON "site_settings_blocks_rich_text_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_rich_text_section_path_idx" ON "site_settings_blocks_rich_text_section" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_category_news" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar,
    "category_info_id" integer,
    "limit" numeric DEFAULT 10,
    CONSTRAINT "site_settings_blocks_category_news_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
    
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_category_news_order_idx" ON "site_settings_blocks_category_news" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_category_news_parent_idx" ON "site_settings_blocks_category_news" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_category_news_path_idx" ON "site_settings_blocks_category_news" USING btree ("_path")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_stats_section_stats" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🏥',
    "value" varchar NOT NULL,
    "label" varchar NOT NULL,
    "suffix" varchar,
    CONSTRAINT "site_settings_blocks_stats_section_stats_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_blocks_stats_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_stats_order_idx" ON "site_settings_blocks_stats_section_stats" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_stats_section_stats_parent_idx" ON "site_settings_blocks_stats_section_stats" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_quick_links_section_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "icon" varchar DEFAULT '🔗',
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT true,
    "color" varchar DEFAULT 'primary',
    CONSTRAINT "site_settings_blocks_quick_links_section_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_blocks_quick_links_section" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_links_order_idx" ON "site_settings_blocks_quick_links_section_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_quick_links_section_links_parent_idx" ON "site_settings_blocks_quick_links_section_links" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_menu_menu_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "preset_url" varchar,
    "url" varchar,
    "open_in_new_tab" boolean,
    CONSTRAINT "site_settings_menu_menu_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_order_idx" ON "site_settings_menu_menu_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_parent_idx" ON "site_settings_menu_menu_items" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_menu_menu_items_sub_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "preset_url" varchar,
    "url" varchar,
    "open_in_new_tab" boolean,
    CONSTRAINT "site_settings_menu_menu_items_sub_items_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings_menu_menu_items" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_sub_items_order_idx" ON "site_settings_menu_menu_items_sub_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_menu_menu_items_sub_items_parent_idx" ON "site_settings_menu_menu_items_sub_items" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_footer_quick_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "site_settings_footer_quick_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_quick_links_order_idx" ON "site_settings_footer_quick_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_quick_links_parent_idx" ON "site_settings_footer_quick_links" USING btree ("_parent_id")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_footer_social_links" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "platform" varchar,
    "label" varchar,
    "url" varchar,
    CONSTRAINT "site_settings_footer_social_links_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_social_links_order_idx" ON "site_settings_footer_social_links" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_footer_social_links_parent_idx" ON "site_settings_footer_social_links" USING btree ("_parent_id")`,

  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_site_name" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_id" integer`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_height" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_position" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_show_site_name" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_site_name_line1" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_site_name_line2" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_site_tagline" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_banner_image_id" integer`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_mobile_logo_id" integer`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_mobile_logo_height" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_logo_hover_effect" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_logo_customization_mobile_show_site_name" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_search_customization_position" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_search_customization_style" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_search_customization_width" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_hotline_phone" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_hotline_action_link" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_hotline_position" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_facebook" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_youtube" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_twitter" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_instagram" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "menu_menu_position" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "sidebar_width_ratio" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "sidebar_gap_size" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_about_text" text`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_address_main" text`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_address_sub" text`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_phone" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_email" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_copyright_text" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_designer_credit" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_layout" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_ban_lanh_dao" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_phong" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_khoa" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_org_colors_khac" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_size" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_custom_height" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_effect" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "banner_hero_slider_autoplay_delay" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_limit" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_columns_desktop" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_columns_mobile" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_news_layout" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_enabled" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_welcome_message" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_chat_custom_prompt" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_ai_hotline" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_ai_address" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_chat_settings_ai_model" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_font_size" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_t_t_s" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_f_b" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_share_zalo" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_copy_link" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_print" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "article_reader_tools_show_read_progress" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_content" jsonb`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_primary_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_primary_dark_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_secondary_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_font_family" varchar`,


  // ====================================================
  // BATCH 26 - Add popup to site_settings
  // ====================================================
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_enabled" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_title" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_image_id" integer`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_content" jsonb`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_link_url" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_delay_seconds" numeric`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_show_once" boolean`,


  // ====================================================
  // BATCH 27 - Add popup article fields to site_settings
  // ====================================================
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_type" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_article_id" integer`,
  `UPDATE "site_settings" SET "popup_article_id" = NULL WHERE "popup_article_id" NOT IN (SELECT "id" FROM "articles")`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_popup_article_id_articles_id_fk') THEN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_popup_article_id_articles_id_fk" FOREIGN KEY ("popup_article_id") REFERENCES "articles"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;`,


  // ====================================================
  // BATCH: Add missing SiteSettings columns
  // ====================================================
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "zalo_mini_app_theme_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "zalo_mini_app_banner_image_id" integer`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "zalo_mini_app_features_enable_appointments" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "zalo_mini_app_features_enable_test_results" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "zalo_mini_app_hotline" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "home_content" jsonb`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_primary_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_primary_dark_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_secondary_color" varchar`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "theme_config_font_family" varchar`,

  // ====================================================
  // BATCH: Add menu navStyle field
  // ====================================================
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "menu_nav_style" varchar DEFAULT 'white'`,

  // ====================================================
  // BATCH: Add missing popup fields
  // ====================================================
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_transparent_background" boolean`,
  `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "popup_video_url" varchar`,

  // ====================================================
  // BATCH: Add missing fields for newsCategorySection
  // ====================================================
  `ALTER TABLE "settings_blocks_news_category_section" ADD COLUMN IF NOT EXISTS "title" varchar`,
  `ALTER TABLE "settings_blocks_news_category_section" ADD COLUMN IF NOT EXISTS "show_date" boolean DEFAULT true`,
  `ALTER TABLE "settings_blocks_news_category_section" ADD COLUMN IF NOT EXISTS "show_excerpt" boolean DEFAULT false`,
  
  `ALTER TABLE "site_settings_blocks_news_category_section" ADD COLUMN IF NOT EXISTS "title" varchar`,
  `ALTER TABLE "site_settings_blocks_news_category_section" ADD COLUMN IF NOT EXISTS "show_date" boolean DEFAULT true`,
  `ALTER TABLE "site_settings_blocks_news_category_section" ADD COLUMN IF NOT EXISTS "show_excerpt" boolean DEFAULT false`,

  // ====================================================
  // BATCH: Add missing fields for ServicesLanding CTA
  // ====================================================
  `ALTER TABLE "services_landing" ADD COLUMN IF NOT EXISTS "cta_title" varchar`,
  `ALTER TABLE "services_landing" ADD COLUMN IF NOT EXISTS "cta_description" varchar`,
  `ALTER TABLE "services_landing" ADD COLUMN IF NOT EXISTS "cta_phone_number" varchar`,

  // ====================================================
  // BATCH: Add pricing_table to Services
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "services_pricing_table" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "price" varchar NOT NULL,
    "note" varchar
  )`,
  `DO $$ BEGIN
    ALTER TABLE "services_pricing_table" ADD CONSTRAINT "services_pricing_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "services_pricing_table_order_idx" ON "services_pricing_table" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "services_pricing_table_parent_id_idx" ON "services_pricing_table" USING btree ("_parent_id")`,

  // ====================================================
  // BATCH: Add pricing_file_id to Services
  // ====================================================
  `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "pricing_file_id" integer`,
  `DO $$ BEGIN
    ALTER TABLE "services" ADD CONSTRAINT "services_pricing_file_id_media_id_fk" FOREIGN KEY ("pricing_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "services_pricing_file_idx" ON "services" USING btree ("pricing_file_id")`,

  // ====================================================
  // BATCH: Add pricing_effective_date to Services
  // ====================================================
  `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "pricing_effective_date" timestamp with time zone`,

  // ====================================================
  // BATCH: Add is_pinned to Articles
  // ====================================================
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "is_pinned" boolean`,

  // ====================================================
  // BATCH: Drop Services, ServiceCategories, ServicesLanding
  // Xóa hoàn toàn khỏi database vì đã chuyển sang dùng Articles + Categories
  // ====================================================
  `DROP TABLE IF EXISTS "services_pricing_table" CASCADE`,
  `DROP TABLE IF EXISTS "services_rels" CASCADE`,
  `DROP TABLE IF EXISTS "_services_v" CASCADE`,
  `DROP TABLE IF EXISTS "_services_v_rels" CASCADE`,
  `DROP TABLE IF EXISTS "services" CASCADE`,
  `DROP TABLE IF EXISTS "service_categories" CASCADE`,
  `DROP TABLE IF EXISTS "services_landing" CASCADE`,
  `DROP TABLE IF EXISTS "services_landing_features" CASCADE`,
  `DROP TABLE IF EXISTS "services_landing_process" CASCADE`,
  `DROP TABLE IF EXISTS "services_landing_faq" CASCADE`,
  `ALTER TABLE "_articles_v" ADD COLUMN IF NOT EXISTS "version_is_pinned" boolean DEFAULT false`,
  `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "is_pinned" boolean DEFAULT false`,
  `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "cover_image_id" integer`,

  // ====================================================
  // BATCH: Add Vaccines table and Sidebar Banners array
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "vaccines" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "disease" varchar,
    "target_group" varchar,
    "price" numeric,
    "origin" varchar,
    "status" varchar DEFAULT 'in_stock',
    "notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "vaccines_created_at_idx" ON "vaccines" USING btree ("created_at")`,

  `CREATE TABLE IF NOT EXISTS "site_settings_banner_sidebar_banners" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "image_id" integer NOT NULL,
    "url" varchar,
    "open_in_new_tab" boolean DEFAULT true
  )`,
  `DO $$ BEGIN
    ALTER TABLE "site_settings_banner_sidebar_banners" ADD CONSTRAINT "site_settings_banner_sidebar_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "site_settings_banner_sidebar_banners" ADD CONSTRAINT "site_settings_banner_sidebar_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "site_settings_banner_sidebar_banners_order_idx" ON "site_settings_banner_sidebar_banners" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_banner_sidebar_banners_parent_id_idx" ON "site_settings_banner_sidebar_banners" USING btree ("_parent_id")`,

  // ====================================================
  // BATCH: Add missing relationship column in Payload locked documents
  // ====================================================
  `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "vaccines_id" integer`,
  `DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vaccines_fk" FOREIGN KEY ("vaccines_id") REFERENCES "public"."vaccines"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_vaccines_id_idx" ON "payload_locked_documents_rels" USING btree ("vaccines_id")`,

  // ====================================================
  // FIX: Drop NOT NULL on optional fields in banner_widget block
  // title và link_url là optional nhưng DB có ràng buộc NOT NULL → lỗi khi thêm widget
  // ====================================================
  `ALTER TABLE "site_settings_blocks_banner_widget" ALTER COLUMN "title" DROP NOT NULL`,
  `ALTER TABLE "site_settings_blocks_banner_widget" ALTER COLUMN "link_url" DROP NOT NULL`,
  `ALTER TABLE "site_settings_blocks_banner_widget" ALTER COLUMN "block_name" DROP NOT NULL`,


  // ====================================================
  // BATCH: Convert all block and array ids from integer (serial) to varchar
  // Payload v3 generates String UUIDs for block/array IDs natively,
  // but they were originally created as serial integers in older migrations.
  // This PL/pgSQL block dynamically drops FKs, alters the types, and recreates the FKs.
  // ====================================================
  `DO $$
  DECLARE
      fk RECORD;
      col RECORD;
  BEGIN
      CREATE TEMP TABLE temp_fk_defs_dynamic (
          table_name text,
          constraint_name text,
          column_name text,
          foreign_table_name text,
          foreign_column_name text
      );
  
      FOR fk IN (
          SELECT 
              tc.table_name, 
              tc.constraint_name, 
              kcu.column_name, 
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND (ccu.table_name LIKE '%\_blocks\_%' OR ccu.table_name LIKE '%\_array\_%')
            AND ccu.column_name = 'id'
      ) LOOP
          INSERT INTO temp_fk_defs_dynamic VALUES (fk.table_name, fk.constraint_name, fk.column_name, fk.foreign_table_name, fk.foreign_column_name);
          EXECUTE 'ALTER TABLE "' || fk.table_name || '" DROP CONSTRAINT "' || fk.constraint_name || '"';
      END LOOP;
  
      FOR col IN (
          SELECT table_name, column_name 
          FROM information_schema.columns 
          WHERE column_name = 'id' AND data_type = 'integer' 
            AND (table_name LIKE '%\_blocks\_%' OR table_name LIKE '%\_array\_%')
      ) LOOP
          EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "id" DROP DEFAULT';
          EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "id" TYPE varchar USING id::varchar';
      END LOOP;
  
      FOR col IN (
          SELECT DISTINCT table_name, column_name 
          FROM temp_fk_defs_dynamic
      ) LOOP
          EXECUTE 'ALTER TABLE "' || col.table_name || '" ALTER COLUMN "' || col.column_name || '" TYPE varchar USING "' || col.column_name || '"::varchar';
      END LOOP;
  
      FOR fk IN (
          SELECT * FROM temp_fk_defs_dynamic
      ) LOOP
          EXECUTE 'ALTER TABLE "' || fk.table_name || '" ADD CONSTRAINT "' || fk.constraint_name || '" FOREIGN KEY ("' || fk.column_name || '") REFERENCES "' || fk.foreign_table_name || '" ("' || fk.foreign_column_name || '") ON DELETE cascade ON UPDATE no action';
      END LOOP;
  
      DROP TABLE temp_fk_defs_dynamic;
  EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error occurred: %', SQLERRM;
      DROP TABLE IF EXISTS temp_fk_defs_dynamic;
  END $$;`,


  // ====================================================
  // BATCH: Add latestNewsSection table
  // ====================================================
  `
  DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS "site_settings_blocks_latest_news_section" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "_path" text NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "block_name" varchar,
        "limit" integer,
        "layout" varchar
    );
  EXCEPTION
    WHEN duplicate_table THEN null;
  END $$;
  `,
  `
  DO $$ BEGIN
    ALTER TABLE "site_settings_blocks_latest_news_section" ADD COLUMN IF NOT EXISTS "block_name" varchar;
  EXCEPTION
    WHEN undefined_table THEN null;
    WHEN duplicate_column THEN null;
  END $$;
  `,
  `
  DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS "settings_blocks_latest_news_section" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "_path" text NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "block_name" varchar,
        "limit" integer,
        "layout" varchar
    );
  EXCEPTION
    WHEN duplicate_table THEN null;
  END $$;
  `,
  `
  DO $$ BEGIN
    ALTER TABLE "settings_blocks_latest_news_section" ADD COLUMN IF NOT EXISTS "block_name" varchar;
  EXCEPTION
    WHEN undefined_table THEN null;
    WHEN duplicate_column THEN null;
  END $$;
  `,
  `
  DO $$ BEGIN
    ALTER TABLE "articles_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
    ALTER TABLE "_articles_v_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
  EXCEPTION
    WHEN undefined_table THEN null;
    WHEN duplicate_column THEN null;
  END $$;
  `,

  `CREATE TABLE IF NOT EXISTS "site_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "videos_id" integer,
    CONSTRAINT "site_settings_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "site_settings" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "site_settings_rels_videos_fk"
      FOREIGN KEY ("videos_id") REFERENCES "videos" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_rels_videos_id_idx" ON "site_settings_rels" USING btree ("videos_id")`,

  `CREATE TABLE IF NOT EXISTS "settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "videos_id" integer,
    CONSTRAINT "settings_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT "settings_rels_videos_fk"
      FOREIGN KEY ("videos_id") REFERENCES "videos" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_rels_order_idx" ON "settings_rels" USING btree ("order")`,
  `CREATE INDEX IF NOT EXISTS "settings_rels_parent_idx" ON "settings_rels" USING btree ("parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_rels_path_idx" ON "settings_rels" USING btree ("path")`,
  `CREATE INDEX IF NOT EXISTS "settings_rels_videos_id_idx" ON "settings_rels" USING btree ("videos_id")`

,

  `DO $$ BEGIN ALTER TABLE "site_settings_blocks_video_section" ADD COLUMN IF NOT EXISTS "source_type" varchar DEFAULT 'auto'; EXCEPTION WHEN duplicate_column THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE "settings_blocks_video_section" ADD COLUMN IF NOT EXISTS "source_type" varchar DEFAULT 'auto'; EXCEPTION WHEN duplicate_column THEN null; END $$`,

  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "warning_section_icon" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "warning_section_title" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$`,

  // ====================================================
  // BATCH: Add vaccine_packages collection
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "vaccine_packages" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "target_group" varchar NOT NULL,
    "package_type" varchar DEFAULT 'by_age' NOT NULL,
    "image_id" integer,
    "description" varchar,
    "original_price" numeric,
    "discount_price" numeric NOT NULL,
    "discount_label" varchar,
    "order" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "vaccine_packages_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "vaccine_id" integer,
    "disease_name" varchar,
    "doses" numeric NOT NULL,
    "protocol" varchar,
    "unit_price" numeric,
    "original_unit_price" numeric
  )`,
  `CREATE INDEX IF NOT EXISTS "vaccine_packages_created_at_idx" ON "vaccine_packages" USING btree ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "vaccine_packages_items_order_idx" ON "vaccine_packages_items" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "vaccine_packages_items_parent_idx" ON "vaccine_packages_items" USING btree ("_parent_id")`,
  `DO $$ BEGIN
    ALTER TABLE "vaccine_packages" ADD CONSTRAINT "vaccine_packages_image_id_media_id_fk"
    FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
  END $$`,
  `DO $$ BEGIN
    ALTER TABLE "vaccine_packages_items" ADD CONSTRAINT "vaccine_packages_items_vaccine_id_vaccines_id_fk"
    FOREIGN KEY ("vaccine_id") REFERENCES "vaccines"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
  END $$`,
  `DO $$ BEGIN
    ALTER TABLE "vaccine_packages_items" ADD CONSTRAINT "vaccine_packages_items_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "vaccine_packages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
  END $$`,
  `ALTER TYPE enum_banners_position ADD VALUE IF NOT EXISTS 'vaccine_slider';`,
  `CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
    "id" serial PRIMARY KEY,
    "global_slug" varchar,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY,
    "order" integer,
    "parent_id" integer,
    "path" varchar
  );`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "departments_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "users_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "banners_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "document_signers_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "work_schedules_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "video_channels_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videos_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "form_submissions_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "org_units_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_knowledge_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "api_keys_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "procurements_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vaccines_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vaccine_packages_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN "popup_services_title" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN "popup_services_subtitle" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN "popup_services_mascot_id" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN "popup_services_header_color" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  `CREATE TABLE IF NOT EXISTS "site_settings_popup_services_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon" varchar,
    "icon_image_id" integer,
    "title" varchar,
    "description" varchar,
    "link_url" varchar
  );`,
  `CREATE INDEX IF NOT EXISTS "site_settings_popup_services_items_order_idx" ON "site_settings_popup_services_items" USING btree ("_order");`,
  `CREATE INDEX IF NOT EXISTS "site_settings_popup_services_items_parent_id_idx" ON "site_settings_popup_services_items" USING btree ("_parent_id");`,
  `DO $$ BEGIN
    ALTER TABLE "site_settings_popup_services_items" ADD CONSTRAINT "site_settings_popup_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "site_settings_popup_services_items" ADD CONSTRAINT "site_settings_popup_services_items_icon_image_id_media_id_fk" FOREIGN KEY ("icon_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_popup_services_mascot_id_media_id_fk" FOREIGN KEY ("popup_services_mascot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`
,

  // ====================================================
  // BATCH: vaccineSection block for settings homeSections
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "settings_blocks_vaccine_section" (
    "id" serial PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Goi Vac Xin Bao Ve Toan Dien',
    "subtitle" varchar,
    "limit" numeric DEFAULT 20,
    "show_view_all" boolean DEFAULT true,
    CONSTRAINT "settings_blocks_vaccine_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "settings" ("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_vaccine_section_order_idx" ON "settings_blocks_vaccine_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_vaccine_section_parent_idx" ON "settings_blocks_vaccine_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "settings_blocks_vaccine_section_path_idx" ON "settings_blocks_vaccine_section" USING btree ("_path")`,

  // ====================================================
  // BATCH: vaccineSection block for site_settings homeSections
  // ====================================================
  `CREATE TABLE IF NOT EXISTS "site_settings_blocks_vaccine_section" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "block_name" varchar,
    "title" varchar DEFAULT 'Gói Vắc Xin Bảo Vệ Toàn Diện',
    "subtitle" varchar,
    "limit" numeric DEFAULT 20,
    "show_view_all" boolean DEFAULT true,
    CONSTRAINT "site_settings_blocks_vaccine_section_parent_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action
  )`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_vaccine_section_order_idx" ON "site_settings_blocks_vaccine_section" USING btree ("_order")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_vaccine_section_parent_idx" ON "site_settings_blocks_vaccine_section" USING btree ("_parent_id")`,
  `CREATE INDEX IF NOT EXISTS "site_settings_blocks_vaccine_section_path_idx" ON "site_settings_blocks_vaccine_section" USING btree ("_path")`,

  // ====================================================
  // BATCH: Add scheduleDoses to vaccines (phác đồ chuẩn)
  // ====================================================
  `DO $$ BEGIN ALTER TABLE "vaccines" ADD COLUMN "schedule_doses" numeric; EXCEPTION WHEN duplicate_column THEN null; END $$`,

  // ==================================================
  // BATCH: Add warning_section_is_enabled column
  // ==================================================
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "warning_section_is_enabled" boolean DEFAULT true; EXCEPTION WHEN duplicate_column THEN null; END $$`,

  // ==================================================
  // BATCH: Add orientation column to PDFBlock
  // ==================================================
  `DO $$ BEGIN ALTER TABLE "pages_blocks_pdf_block" ADD COLUMN IF NOT EXISTS "orientation" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE "_pages_v_blocks_pdf_block" ADD COLUMN IF NOT EXISTS "orientation" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$`,

  // ==================================================
  // BATCH: Add Zalo & MiniApp columns to header social links
  // ==================================================
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_zalo" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$`,
  `DO $$ BEGIN ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_social_links_miniapp" varchar; EXCEPTION WHEN duplicate_column THEN null; END $$`
];

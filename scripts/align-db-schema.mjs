process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';
const { Client } = pg;

const connectionString = "postgres://postgres.vjngsodvxzqppedtkbqe:gjsS1JmLD2mkkB9T@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL');

  console.log('Aligning articles and _articles_v schema...');

  // 1. Articles table
  await client.query(`
    -- Add / Alter articles columns
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "title" varchar; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "slug" varchar; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "category_id" integer; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "image_id" integer; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "author_id" integer; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "author_name" varchar; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "review_status" varchar DEFAULT 'draft'; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "content" jsonb; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "views" numeric DEFAULT 0; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "_status" varchar DEFAULT 'published'; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "published_at" timestamp with time zone DEFAULT now(); EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "created_at" timestamp with time zone DEFAULT now(); EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now(); EXCEPTION WHEN others THEN null; END $$;

    -- Fix description to varchar
    DO $$ BEGIN
      ALTER TABLE "articles" ALTER COLUMN "description" TYPE varchar USING "description"::text;
    EXCEPTION WHEN others THEN
      ALTER TABLE "articles" DROP COLUMN IF EXISTS "description";
      ALTER TABLE "articles" ADD COLUMN "description" varchar;
    END $$;

    -- Fix is_pinned to boolean
    DO $$ BEGIN
      ALTER TABLE "articles" ALTER COLUMN "is_pinned" TYPE boolean USING (
        CASE WHEN "is_pinned"::text = '1' OR "is_pinned"::text = 'true' THEN true ELSE false END
      );
      ALTER TABLE "articles" ALTER COLUMN "is_pinned" SET DEFAULT false;
    EXCEPTION WHEN others THEN
      ALTER TABLE "articles" DROP COLUMN IF EXISTS "is_pinned";
      ALTER TABLE "articles" ADD COLUMN "is_pinned" boolean DEFAULT false;
    END $$;

    -- Drop legacy conflict columns
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "tags";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "auto_zalo_broadcast";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "read_time";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "is_featured";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "summary";

    -- Set default values for nulls
    UPDATE "articles" SET "_status" = 'published' WHERE "_status" IS NULL;
    UPDATE "articles" SET "review_status" = 'draft' WHERE "review_status" IS NULL;
    UPDATE "articles" SET "is_pinned" = false WHERE "is_pinned" IS NULL;
    UPDATE "articles" SET "views" = 0 WHERE "views" IS NULL;
  `);
  console.log('✅ articles table schema aligned!');

  // 2. _articles_v table
  await client.query(`
    -- Drop and recreate _articles_v to guarantee exact match with Drizzle/Payload schema
    DROP TABLE IF EXISTS "_articles_v" CASCADE;

    CREATE TABLE "_articles_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_is_pinned" boolean DEFAULT false,
      "version_title" varchar,
      "version_published_at" timestamp with time zone DEFAULT now(),
      "version_slug" varchar,
      "version_category_id" integer,
      "version_description" varchar,
      "version_image_id" integer,
      "version_author_id" integer,
      "version_review_status" varchar DEFAULT 'draft',
      "version_content" jsonb,
      "version_author_name" varchar,
      "version_views" numeric DEFAULT 0,
      "version__status" varchar DEFAULT 'published',
      "version_updated_at" timestamp with time zone DEFAULT now(),
      "version_created_at" timestamp with time zone DEFAULT now(),
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "latest" integer DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS "_articles_v_parent_id_idx" ON "_articles_v" ("parent_id");
    CREATE INDEX IF NOT EXISTS "_articles_v_version_version_slug_idx" ON "_articles_v" ("version_slug");
    CREATE INDEX IF NOT EXISTS "_articles_v_version_version__status_idx" ON "_articles_v" ("version__status");
    CREATE INDEX IF NOT EXISTS "_articles_v_created_at_idx" ON "_articles_v" ("created_at");
    CREATE INDEX IF NOT EXISTS "_articles_v_updated_at_idx" ON "_articles_v" ("updated_at");
    CREATE INDEX IF NOT EXISTS "_articles_v_latest_idx" ON "_articles_v" ("latest");
  `);
  console.log('✅ _articles_v table schema aligned!');

  // 3. articles_rels and _articles_v_rels
  await client.query(`
    DROP TABLE IF EXISTS "_articles_v_rels" CASCADE;

    CREATE TABLE "_articles_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer,
      "tags_id" integer,
      "media_id" integer,
      "users_id" integer
    );

    CREATE INDEX IF NOT EXISTS "_articles_v_rels_order_idx" ON "_articles_v_rels" ("order");
    CREATE INDEX IF NOT EXISTS "_articles_v_rels_parent_idx" ON "_articles_v_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "_articles_v_rels_path_idx" ON "_articles_v_rels" ("path");

    CREATE TABLE IF NOT EXISTS "articles_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer,
      "tags_id" integer,
      "media_id" integer,
      "users_id" integer
    );

    DO $$ BEGIN ALTER TABLE "articles_rels" ADD COLUMN "categories_id" integer; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles_rels" ADD COLUMN "tags_id" integer; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles_rels" ADD COLUMN "media_id" integer; EXCEPTION WHEN others THEN null; END $$;
    DO $$ BEGIN ALTER TABLE "articles_rels" ADD COLUMN "users_id" integer; EXCEPTION WHEN others THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "articles_rels_order_idx" ON "articles_rels" ("order");
    CREATE INDEX IF NOT EXISTS "articles_rels_parent_idx" ON "articles_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "articles_rels_path_idx" ON "articles_rels" ("path");
  `);
  console.log('✅ articles_rels and _articles_v_rels aligned!');

  // 4. Test insert article + version
  const insArt = await client.query(`
    INSERT INTO "articles" (
      "title", "slug", "description", "content", "review_status", "is_pinned", "_status", "created_at", "updated_at"
    ) VALUES (
      'Giới thiệu Hợp tác xã Rau an toàn Túy Loan',
      'gioi-thieu-hop-tac-xa-rau-an-toan-tuy-loan',
      'Hợp tác xã sản xuất và cung ứng rau sạch theo tiêu chuẩn VietGAP tại Hòa Vang, Đà Nẵng.',
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"HTX Rau An Toàn Túy Loan cung ứng rau sạch tươi ngon mỗi ngày đạt chuẩn VietGAP.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
      'approved',
      true,
      'published',
      NOW(),
      NOW()
    ) RETURNING id, title, slug, is_pinned, _status;
  `);
  console.log('✅ INSERT INTO articles SUCCESS:', insArt.rows[0]);
  const artId = insArt.rows[0].id;

  const insV = await client.query(`
    INSERT INTO "_articles_v" (
      "parent_id", "version_title", "version_slug", "version_description", "version_content", "version_review_status", "version_is_pinned", "version__status", "latest", "created_at", "updated_at"
    ) VALUES (
      $1,
      'Giới thiệu Hợp tác xã Rau an toàn Túy Loan',
      'gioi-thieu-hop-tac-xa-rau-an-toan-tuy-loan',
      'Hợp tác xã sản xuất và cung ứng rau sạch theo tiêu chuẩn VietGAP tại Hòa Vang, Đà Nẵng.',
      '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"HTX Rau An Toàn Túy Loan cung ứng rau sạch tươi ngon mỗi ngày đạt chuẩn VietGAP.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
      'approved',
      true,
      'published',
      1,
      NOW(),
      NOW()
    ) RETURNING id, parent_id, version_title, version_is_pinned;
  `, [artId]);
  console.log('✅ INSERT INTO _articles_v SUCCESS:', insV.rows[0]);

  await client.end();
  console.log('\n🎉 ALL DATABASE FIXES APPLIED SUCCESSFULLY TO SUPABASE IN REAL TIME!');
}

main().catch(console.error);

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, any> = {};

  try {
    const payload = await getPayload({ config: configPromise });
    
    // Check raw Postgres columns if pg client is available
    try {
      if ((payload.db as any)?.drizzle?.execute) {
        const drizzle = (payload.db as any).drizzle;
        const rawColsArticles = await drizzle.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles'");
        diagnostics.articlesColumns = rawColsArticles.rows || rawColsArticles;

        const rawColsArticlesV = await drizzle.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '_articles_v'");
        diagnostics.articlesVColumns = rawColsArticlesV.rows || rawColsArticlesV;

        const rawColsArticlesRels = await drizzle.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles_rels'");
        diagnostics.articlesRelsColumns = rawColsArticlesRels.rows || rawColsArticlesRels;

        const rawColsArticlesVRels = await drizzle.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '_articles_v_rels'");
        diagnostics.articlesVRelsColumns = rawColsArticlesVRels.rows || rawColsArticlesVRels;
      }
    } catch (dbErr: any) {
      diagnostics.dbInspectError = dbErr.message;
    }

    // Test direct find on articles
    try {
      const result = await payload.find({
        collection: 'articles',
        depth: 0,
        limit: 5,
        overrideAccess: true,
      });
      diagnostics.findArticles = {
        success: true,
        totalDocs: result.totalDocs,
        docsCount: result.docs?.length,
      };
    } catch (findErr: any) {
      diagnostics.findArticles = {
        success: false,
        error: findErr.message,
        stack: findErr.stack,
        cause: findErr.cause?.message || findErr.cause,
      };
    }

    // Test find with draft: true (which queries _articles_v / versions)
    try {
      const resultDraft = await payload.find({
        collection: 'articles',
        depth: 0,
        limit: 5,
        draft: true,
        overrideAccess: true,
      });
      diagnostics.findArticlesDraft = {
        success: true,
        totalDocs: resultDraft.totalDocs,
        docsCount: resultDraft.docs?.length,
      };
    } catch (draftErr: any) {
      diagnostics.findArticlesDraft = {
        success: false,
        error: draftErr.message,
        stack: draftErr.stack,
        cause: draftErr.cause?.message || draftErr.cause,
      };
    }

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      diagnostics,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack,
    }, { status: 500 });
  }
}

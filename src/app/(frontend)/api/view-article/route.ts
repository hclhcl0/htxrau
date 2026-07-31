import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });

    if (result.totalDocs === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const article = result.docs[0];
    const newViews = ((article as any).views || 0) + 1;

    await payload.update({
      collection: 'articles',
      id: article.id,
      data: { views: newViews },
      overrideAccess: true,
    });

    return NextResponse.json({ views: newViews });
  } catch (err) {
    console.error('[view-article]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

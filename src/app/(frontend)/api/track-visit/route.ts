import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST() {
  try {
    const payload = await getPayload({ config: configPromise });

    // Dùng global 'site-stats' để lưu tổng lượt truy cập
    const stats = await payload.findGlobal({ slug: 'site-stats' }) as any;

    const todayKey = new Date().toISOString().slice(0, 10); // "2026-07-31"
    const currentTotal = (stats?.totalVisits || 0) + 1;
    const currentToday = stats?.lastVisitDate === todayKey
      ? (stats?.todayVisits || 0) + 1
      : 1;

    await payload.updateGlobal({
      slug: 'site-stats',
      data: {
        totalVisits: currentTotal,
        todayVisits: currentToday,
        lastVisitDate: todayKey,
      },
      overrideAccess: true,
    });

    return NextResponse.json({ totalVisits: currentTotal, todayVisits: currentToday });
  } catch (err) {
    console.error('[track-visit]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const stats = await payload.findGlobal({ slug: 'site-stats' }) as any;
    const todayKey = new Date().toISOString().slice(0, 10);

    return NextResponse.json({
      totalVisits: stats?.totalVisits || 0,
      todayVisits: stats?.lastVisitDate === todayKey ? (stats?.todayVisits || 0) : 0,
    });
  } catch {
    return NextResponse.json({ totalVisits: 0, todayVisits: 0 });
  }
}

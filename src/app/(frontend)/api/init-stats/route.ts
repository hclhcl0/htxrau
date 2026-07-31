import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  if (secret !== 'vnos-cdc-seed') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cho phép truyền giá trị qua query param, hoặc dùng mặc định từ ksbtdanang.vn
  const totalVisits = parseInt(url.searchParams.get('total') || '37708898');
  const todayVisits = parseInt(url.searchParams.get('today') || '4056');
  const monthVisits = parseInt(url.searchParams.get('month') || '386763');
  const todayKey = new Date().toISOString().slice(0, 10);
  const monthKey = new Date().toISOString().slice(0, 7);

  try {
    const payload = await getPayload({ config: configPromise });

    await payload.updateGlobal({
      slug: 'site-stats',
      data: {
        totalVisits,
        todayVisits,
        monthVisits,
        lastVisitDate: todayKey,
        lastVisitMonth: monthKey,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Đã khởi tạo số liệu thống kê thành công!',
      data: { totalVisits, todayVisits, monthVisits, lastVisitDate: todayKey, lastVisitMonth: monthKey },
    });
  } catch (err) {
    console.error('[init-stats]', err);
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 });
  }
}

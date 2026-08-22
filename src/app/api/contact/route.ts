import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sendTelegramOrderNotification } from '@/lib/telegramNotify';
import { sendEmailOrderNotification } from '@/lib/emailNotify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support both field naming conventions (contact page & generic contact form)
    const fullName = (body.fullName || body.name || '').trim();
    const phone = (body.phone || '').trim();
    const email = (body.email || '').trim();
    const customerType = (body.customerType || body.organization || 'Báo giá sỉ').trim();
    const content = (body.content || body.message || body.title || body.subject || '').trim();

    // Validation
    if (!fullName) {
      return NextResponse.json({ error: 'Vui lòng nhập họ và tên.' }, { status: 400 });
    }
    if (!phone || !/^(0|\+84)[0-9]{8,10}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ.' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Vui lòng nhập nội dung yêu cầu.' }, { status: 400 });
    }

    // Generate code (BG = Báo Giá)
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    const orderCode = `BG-${y}${m}${d}-${rand}`;

    const totalNote = `[${customerType}] ${email ? `Email: ${email} | ` : ''}${content}`;

    const items = [
      {
        productName: `Yêu cầu: ${customerType}`,
        quantity: 1,
        unit: 'bo',
        itemNote: content,
      },
    ];

    // Ghi trực tiếp vào Database (Collection Orders)
    const payload = await getPayload({ config: configPromise });
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderCode,
        customerName: fullName,
        customerPhone: phone,
        customerAddress: `Khách: ${customerType}${email ? ` (${email})` : ''}`,
        items,
        totalNote,
        paymentMethod: 'phone',
        source: 'website',
        status: 'new',
      } as any,
      overrideAccess: true,
    });

    // Gửi thông báo Telegram + Email
    const notifPayload = {
      orderCode,
      customerName: `${fullName} [${customerType}]`,
      customerPhone: phone,
      customerAddress: email ? `Email: ${email}` : customerType,
      items,
      totalNote,
      paymentMethod: 'phone',
    };

    sendTelegramOrderNotification(notifPayload).catch(() => {});
    sendEmailOrderNotification(notifPayload).catch(() => {});

    return NextResponse.json({
      success: true,
      orderCode,
      orderId: order.id,
      message: 'Đã gửi yêu cầu thành công! HTX sẽ liên hệ lại sớm nhất.',
    });
  } catch (err: any) {
    console.error('[Contact API] Error:', err);
    return NextResponse.json(
      { error: 'Lỗi hệ thống khi gửi thông tin. Vui lòng liên hệ trực tiếp hotline.' },
      { status: 500 }
    );
  }
}

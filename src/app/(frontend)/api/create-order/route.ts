import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sendTelegramOrderNotification } from '@/lib/telegramNotify';
import { sendEmailOrderNotification } from '@/lib/emailNotify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalNote,
      paymentMethod,
      requestedDeliveryDate,
    } = body;

    // ── Validation ───────────────────────────────────────────────
    if (!customerName?.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên.' }, { status: 400 });
    }
    if (!customerPhone?.trim() || !/^(0|\+84)[0-9]{8,10}$/.test(customerPhone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ.' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Vui lòng chọn ít nhất 1 sản phẩm.' }, { status: 400 });
    }
    for (const it of items) {
      if (!it.productName && !it.product) {
        return NextResponse.json({ error: 'Tên sản phẩm không hợp lệ.' }, { status: 400 });
      }
      if (!it.quantity || it.quantity <= 0) {
        return NextResponse.json({ error: 'Số lượng phải lớn hơn 0.' }, { status: 400 });
      }
    }

    // ── Tạo mã đơn hàng ─────────────────────────────────────────
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    const orderCode = `DH-${y}${m}${d}-${rand}`;

    // ── Chuẩn hoá items ──────────────────────────────────────────
    const cleanItems = items.map((it: any) => ({
      product: it.product || undefined,
      productName: it.productName || it.name || '',
      quantity: Number(it.quantity),
      unit: it.unit || 'kg',
      unitPrice: it.unitPrice ? Number(it.unitPrice) : undefined,
      itemNote: it.itemNote || '',
    }));

    // ── Ghi vào Payload (Local API — bypass auth) ────────────────
    const payload = await getPayload({ config: configPromise });
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderCode,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress?.trim() || '',
        items: cleanItems,
        totalNote: totalNote?.trim() || '',
        paymentMethod: paymentMethod || 'cod',
        source: 'website',
        status: 'new',
        requestedDeliveryDate: requestedDeliveryDate || undefined,
      } as any,
      overrideAccess: true,
    });

    // ── Gửi thông báo (fire-and-forget) ─────────────────────────
    const notifPayload = {
      orderCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress?.trim(),
      items: cleanItems,
      totalNote: totalNote?.trim(),
      paymentMethod: paymentMethod || 'cod',
      requestedDeliveryDate,
    };

    // Không await — không block response
    sendTelegramOrderNotification(notifPayload).catch(() => {});
    sendEmailOrderNotification(notifPayload).catch(() => {});

    return NextResponse.json({
      success: true,
      orderCode,
      orderId: order.id,
    });
  } catch (err: any) {
    console.error('[create-order] Error:', err);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại hoặc gọi hotline.' },
      { status: 500 },
    );
  }
}

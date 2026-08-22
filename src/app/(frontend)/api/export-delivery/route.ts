import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * GET /api/export-delivery?date=2026-08-22
 * GET /api/export-delivery?ids=1,2,3
 * GET /api/export-delivery?status=confirmed,preparing,delivering
 * Returns HTML phiếu giao hàng để in
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const idsParam = searchParams.get('ids');
  const statusParam = searchParams.get('status');

  const payload = await getPayload({ config: configPromise });

  // Build where clause
  const where: Record<string, any> = {};
  if (idsParam) {
    const ids = idsParam.split(',').map(Number).filter(Boolean);
    where.id = { in: ids };
  } else if (dateParam) {
    // Filter by requested delivery date OR created date
    where.or = [
      {
        requestedDeliveryDate: {
          greater_than_equal: `${dateParam}T00:00:00.000Z`,
          less_than_equal: `${dateParam}T23:59:59.999Z`,
        },
      },
      {
        and: [
          { requestedDeliveryDate: { exists: false } },
          {
            createdAt: {
              greater_than_equal: `${dateParam}T00:00:00.000Z`,
              less_than_equal: `${dateParam}T23:59:59.999Z`,
            },
          },
        ],
      },
    ];
  }

  // Filter by status
  const statuses = statusParam
    ? statusParam.split(',')
    : ['new', 'confirmed', 'preparing', 'delivering'];
  
  if (statuses.length > 0 && statuses[0] !== 'all') {
    where.status = { in: statuses };
  }

  const result = await payload.find({
    collection: 'orders',
    where,
    limit: 200,
    depth: 1,
    sort: 'requestedDeliveryDate',
  });

  const orders = result.docs;

  if (orders.length === 0) {
    return new NextResponse(
      `<!DOCTYPE html><html><body><h2 style="font-family:sans-serif;text-align:center;padding:40px">Không tìm thấy đơn hàng phù hợp để giao.</h2></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const payLabel: Record<string, string> = {
    cod: 'COD — Tiền mặt',
    qr: 'Chuyển khoản QR',
    phone: 'Liên hệ',
  };
  const statusLabel: Record<string, string> = {
    new: 'Mới',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    delivering: 'Đang giao',
    done: 'Hoàn thành',
    cancelled: 'Đã huỷ',
  };

  const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const deliveryDate = dateParam
    ? new Date(dateParam).toLocaleDateString('vi-VN')
    : today;

  const totalRevenue = orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const codOrders = orders.filter(o => o.paymentMethod !== 'qr');
  const qrOrders = orders.filter(o => o.paymentMethod === 'qr');
  const codAmount = codOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);

  function renderItems(items: any[]): string {
    if (!items?.length) return '<em style="color:#999">Chưa có chi tiết sản phẩm</em>';
    return items
      .map((it, i) => {
        const name = it.productName || (it.product?.name || 'Sản phẩm');
        const unitMap: Record<string, string> = { bo: 'bó', hop: 'hộp', tui: 'túi', cai: 'cái', khay: 'khay', kg: 'kg', gram: 'gram' };
        const unitLabel = unitMap[it.unit] || it.unit;
        const price = it.unitPrice
          ? `<span style="color:#16a34a;font-weight:600">${Number(it.unitPrice).toLocaleString('vi-VN')}đ/${unitLabel}</span>`
          : '';
        const note = it.itemNote ? `<span style="color:#6b7280;font-size:11px"> • ${it.itemNote}</span>` : '';
        return `<div style="padding:4px 0;display:flex;gap:8px;align-items:center">
          <span style="background:#e5e7eb;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0">${i + 1}</span>
          <span><b>${name}</b> × <b>${it.quantity} ${unitLabel}</b> ${price}${note}</span>
        </div>`;
      })
      .join('');
  }

  const orderCards = orders.map((o, idx) => {
    const payMethod = o.paymentMethod || 'cod';
    const isCod = payMethod !== 'qr';
    const delivDate = o.requestedDeliveryDate
      ? new Date(o.requestedDeliveryDate).toLocaleDateString('vi-VN')
      : '—';
    return `
    <div class="order-card" style="border:1.5px solid #d1fae5;border-radius:12px;padding:16px 20px;margin-bottom:16px;page-break-inside:avoid;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:12px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:13px;background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-weight:700;letter-spacing:.5px">${o.orderCode || `#${o.id}`}</span>
            <span style="font-size:12px;background:${isCod ? '#fef3c7' : '#dbeafe'};color:${isCod ? '#92400e' : '#1e40af'};padding:2px 8px;border-radius:20px">${payLabel[payMethod]}</span>
            <span style="font-size:12px;background:#f3f4f6;color:#374151;padding:2px 8px;border-radius:20px">${statusLabel[o.status] || o.status}</span>
          </div>
          <div style="margin-top:6px">
            <b style="font-size:15px">${o.customerName}</b>
            <span style="font-size:13px;color:#6b7280;margin-left:8px">📞 ${o.customerPhone}</span>
          </div>
          ${o.customerAddress ? `<div style="font-size:12px;color:#374151;margin-top:3px">📍 ${o.customerAddress}</div>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          ${o.totalAmount ? `<div style="font-size:17px;font-weight:800;color:#15803d">${Number(o.totalAmount).toLocaleString('vi-VN')} đ</div>` : '<div style="font-size:12px;color:#9ca3af">Chưa có giá</div>'}
          ${delivDate !== '—' ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">📅 Giao: ${delivDate}</div>` : ''}
        </div>
      </div>
      <div style="background:#f0fdf4;border-radius:8px;padding:10px 12px;font-size:13px">
        ${renderItems(o.items as any[])}
      </div>
      ${o.totalNote ? `<div style="margin-top:8px;font-size:12px;background:#fffbeb;border-left:3px solid #f59e0b;padding:6px 10px;border-radius:4px">📝 <b>Ghi chú:</b> ${o.totalNote}</div>` : ''}
      <div style="display:flex;gap:16px;margin-top:12px">
        <div style="flex:1;border:1px dashed #d1d5db;border-radius:6px;padding:6px 10px;font-size:11px;color:#9ca3af;min-height:40px">Khách ký nhận:</div>
        <div style="flex:1;border:1px dashed #d1d5db;border-radius:6px;padding:6px 10px;font-size:11px;color:#9ca3af;min-height:40px">${isCod ? 'Đã thu tiền mặt: ________________ đ' : 'Đã chuyển khoản ✓'}</div>
      </div>
    </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Phiếu Giao Hàng — HTX Rau Túy Loan</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #f3f4f6; color: #111827; font-size: 13px; }
    .container { max-width: 820px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #15803d, #16a34a); color: #fff; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .summary-card { background: #fff; border-radius: 10px; padding: 12px 16px; border: 1px solid #e5e7eb; text-align: center; }
    .summary-card .num { font-size: 22px; font-weight: 800; color: #15803d; }
    .summary-card .lbl { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .print-btn { display:inline-flex;align-items:center;gap:6px;background:#15803d;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px; }
    .print-btn:hover { background:#166534; }
    @media print {
      body { background: #fff; }
      .container { max-width: 100%; padding: 0; }
      .no-print { display: none !important; }
      .order-card { border: 1px solid #ccc !important; margin-bottom: 12px !important; }
      .header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .summary-grid { grid-template-columns: repeat(4, 1fr); }
    }
    @page { size: A4; margin: 10mm; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h1 style="font-size:22px;font-weight:800;margin-bottom:4px">🥬 HTX Rau An Toàn Túy Loan</h1>
          <p style="font-size:13px;opacity:.85">Phiếu Giao Hàng · VietGAP · Túy Loan, Đà Nẵng</p>
        </div>
        <div style="text-align:right;font-size:13px;opacity:.9">
          <div>📅 Ngày xuất: <b>${deliveryDate}</b></div>
          <div>🖨️ In lúc: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
        </div>
      </div>
    </div>

    <div class="no-print" style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="print-btn" onclick="window.print()">🖨️ In Phiếu Giao Hàng (A4)</button>
      <a href="/admin/collections/orders" style="display:inline-flex;align-items:center;gap:6px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;padding:9px 18px;border-radius:8px;text-decoration:none;font-size:13px">← Đóng</a>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="num">${orders.length}</div>
        <div class="lbl">Tổng số đơn</div>
      </div>
      <div class="summary-card">
        <div class="num" style="color:#92400e">${codOrders.length}</div>
        <div class="lbl">Đơn COD (tiền mặt)</div>
      </div>
      <div class="summary-card">
        <div class="num" style="color:#1e40af">${qrOrders.length}</div>
        <div class="lbl">Đơn chuyển khoản</div>
      </div>
      <div class="summary-card">
        <div class="num">${totalRevenue ? Number(totalRevenue).toLocaleString('vi-VN') + 'đ' : '—'}</div>
        <div class="lbl">Tổng doanh thu</div>
      </div>
    </div>

    ${codAmount > 0 ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:13px">
      💵 <b>Cần thu tiền mặt (COD):</b> <span style="font-size:16px;font-weight:800;color:#92400e">${Number(codAmount).toLocaleString('vi-VN')} đ</span>
      <span style="color:#6b7280;font-size:12px"> (từ ${codOrders.length} đơn)</span>
    </div>` : ''}

    ${orderCards}

    <div style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#9ca3af;text-align:center">
      HTX Rau An Toàn Túy Loan · VietGAP · Điện thoại: 0905 559 206 · Túy Loan, Hòa Phong, Hòa Vang, Đà Nẵng
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import * as XLSX from 'xlsx';

const STATUS_LABELS: Record<string, string> = {
  new: 'Mới — Chưa xử lý',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  delivering: 'Đang giao hàng',
  done: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  zalo: 'Zalo',
  facebook: 'Facebook',
  phone: 'Điện thoại',
  direct: 'Khách trực tiếp',
  other: 'Khác',
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Tiền mặt (COD)',
  qr: 'Chuyển khoản QR',
  phone: 'Điện thoại / Zalo',
};

const UNIT_LABELS: Record<string, string> = {
  kg: 'kg', gram: 'gram', bo: 'bó', hop: 'hộp',
  tui: 'túi', cai: 'cái', khay: 'khay',
};

function fmt(d?: string | Date | null): string {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
}

function fmtMoney(n?: number | null): number { return n || 0; }

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const dateParam   = params.get('date');
    const statusParam = params.get('status');
    const fromParam   = params.get('from');
    const toParam     = params.get('to');
    const allParam    = params.get('all');

    const payload = await getPayload({ config: configPromise });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (statusParam) {
      const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean);
      where['status'] = statuses.length === 1 ? { equals: statuses[0] } : { in: statuses };
    }
    if (dateParam) {
      const start = new Date(dateParam + 'T00:00:00.000Z');
      const end   = new Date(dateParam + 'T23:59:59.999Z');
      where['requestedDeliveryDate'] = { greater_than_equal: start, less_than_equal: end };
    }
    if (fromParam && toParam) {
      where['createdAt'] = {
        greater_than_equal: new Date(fromParam + 'T00:00:00.000Z'),
        less_than_equal:    new Date(toParam   + 'T23:59:59.999Z'),
      };
    } else if (!dateParam && !allParam) {
      const d = new Date(); d.setDate(d.getDate() - 30);
      where['createdAt'] = { greater_than_equal: d };
    }

    const result = await payload.find({
      collection: 'orders',
      where,
      limit: 500,
      sort: '-createdAt',
      depth: 2,
    });

    const orders = result.docs;

    // ── Sheet 1: Tổng hợp đơn hàng ──────────────────────────
    const S1 = [
      ['Mã đơn', 'Ngày tạo', 'Ngày giao', 'Khách hàng', 'SĐT', 'Địa chỉ giao', 'Nguồn', 'Trạng thái', 'Thanh toán', 'Tổng tiền (VNĐ)', 'NV phụ trách', 'Ghi chú'],
      ...orders.map(o => {
        const asgn = o.assignedTo
          ? (typeof o.assignedTo === 'object'
            ? ((o.assignedTo as {name?:string;email?:string}).name || (o.assignedTo as {email?:string}).email || '')
            : String(o.assignedTo))
          : '';
        return [
          o.orderCode || '',
          fmt(o.createdAt),
          fmt(o.requestedDeliveryDate as string|undefined),
          o.customerName  || '',
          o.customerPhone || '',
          o.customerAddress || '',
          SOURCE_LABELS[o.source as string]  || o.source  || '',
          STATUS_LABELS[o.status as string]  || o.status  || '',
          PAYMENT_LABELS[o.paymentMethod as string] || o.paymentMethod || '',
          fmtMoney(o.totalAmount as number|undefined),
          asgn,
          o.totalNote || '',
        ];
      }),
    ];

    // ── Sheet 2: Chi tiết sản phẩm ──────────────────────────
    type OrderItem = {product?:{name?:string}|number|string;productName?:string;quantity?:number;unit?:string;unitPrice?:number;itemNote?:string};
    const S2 = [
      ['Mã đơn', 'Khách hàng', 'Ngày tạo', 'Sản phẩm', 'Số lượng', 'Đơn vị', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)', 'Ghi chú SP'],
    ];
    for (const o of orders) {
      const items = (o.items as OrderItem[]) || [];
      if (!items.length) {
        S2.push([o.orderCode||'', o.customerName||'', fmt(o.createdAt), '(Không có SP)', '', '', 0, 0, '']);
        continue;
      }
      for (const item of items) {
        const name = item.productName
          || (item.product && typeof item.product === 'object' && 'name' in item.product
            ? (item.product as {name?:string}).name || '' : '')
          || '';
        const qty  = item.quantity  || 0;
        const price = item.unitPrice || 0;
        S2.push([
          o.orderCode||'', o.customerName||'', fmt(o.createdAt),
          name, qty, UNIT_LABELS[item.unit as string] || item.unit || '',
          price, qty * price, item.itemNote || '',
        ]);
      }
    }

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(S1);
    ws1['!cols'] = [{wch:20},{wch:12},{wch:12},{wch:25},{wch:14},{wch:38},{wch:14},{wch:18},{wch:18},{wch:16},{wch:20},{wch:40}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Danh sach don hang');
    const ws2 = XLSX.utils.aoa_to_sheet(S2);
    ws2['!cols'] = [{wch:20},{wch:25},{wch:12},{wch:30},{wch:10},{wch:10},{wch:15},{wch:15},{wch:35}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiet san pham');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const today = new Date();
    const ds = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    let sfx = dateParam ? `_Ngay${dateParam.replace(/-/g,'')}` : '';
    if (statusParam) sfx += `_${statusParam.replace(/,/g,'-')}`;
    if (allParam)    sfx += '_TatCa';
    const filename = `DonHang_HTXTuyLoan${sfx}_${ds}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[export-orders]', err);
    return NextResponse.json({ error: 'Export failed', detail: String(err) }, { status: 500 });
  }
}

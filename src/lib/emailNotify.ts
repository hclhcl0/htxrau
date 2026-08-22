/**
 * Email Order Notification (via Nodemailer / SMTP)
 * Gửi email thông báo đơn hàng tới admin khi có đơn mới
 * Cấu hình: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL trong .env.local
 */
import nodemailer from 'nodemailer';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function sendEmailOrderNotification(order: {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: { productName?: string; product?: any; quantity: number; unit: string; unitPrice?: number }[];
  totalAmount?: number;
  totalNote?: string;
  paymentMethod?: string;
  requestedDeliveryDate?: string;
}): Promise<void> {
  const payload = await getPayload({ config: configPromise });
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any;
  const notifSettings = settings?.payment?.notifications || {};

  const smtpHost = notifSettings.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = notifSettings.smtpPort || Number(process.env.SMTP_PORT || 587);
  const smtpSecure = notifSettings.smtpSecure ?? (process.env.SMTP_SECURE === 'true');
  const smtpUser = notifSettings.smtpUser || process.env.SMTP_USER;
  const smtpPass = notifSettings.smtpPass || process.env.SMTP_PASS;
  const adminEmail = notifSettings.adminEmail || process.env.ADMIN_EMAIL;

  if (!smtpUser || !adminEmail || !smtpPass) return;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });


  const paymentLabel: Record<string, string> = {
    cod: '💵 Tiền mặt khi giao (COD)',
    qr: '🏦 Chuyển khoản QR',
    bank: '🏦 Chuyển khoản ngân hàng',
  };
  const payStr = paymentLabel[order.paymentMethod || 'cod'] || '💵 Tiền mặt khi giao (COD)';

  const itemRows = order.items
    .map((it, i) => {
      const name = it.productName || (it.product?.name as string) || 'Sản phẩm';
      const price = it.unitPrice
        ? `${Number(it.unitPrice).toLocaleString('vi-VN')} đ/${it.unit}`
        : '—';
      return `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;">${i + 1}. ${name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;">${it.quantity} ${it.unit}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;">${price}</td>
      </tr>`;
    })
    .join('');

  const totalRow = order.totalAmount
    ? `<tr style="background:#f0fdf4;font-weight:bold;">
        <td colspan="2" style="padding:8px 10px;">Tổng tiền đơn hàng</td>
        <td style="padding:8px 10px;text-align:right;color:#15803d;">${Number(order.totalAmount).toLocaleString('vi-VN')} đ</td>
      </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;">🛒 Đơn Hàng Mới</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">HTX Rau An Toàn Túy Loan · VietGAP</p>
          </td>
        </tr>
        <!-- Order code banner -->
        <tr>
          <td style="background:#f0fdf4;padding:14px 32px;border-bottom:1px solid #dcfce7;">
            <span style="font-size:13px;color:#4b5563;">Mã đơn hàng:</span>
            <strong style="font-size:18px;color:#15803d;margin-left:8px;letter-spacing:1px;">${order.orderCode}</strong>
          </td>
        </tr>
        <!-- Customer info -->
        <tr>
          <td style="padding:24px 32px;">
            <h2 style="margin:0 0 14px;font-size:15px;color:#374151;">👤 Thông Tin Khách Hàng</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
              <tr><td style="padding:4px 0;width:140px;color:#6b7280;">Họ tên:</td><td><strong>${order.customerName}</strong></td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">Số điện thoại:</td><td><a href="tel:${order.customerPhone}" style="color:#16a34a;">${order.customerPhone}</a></td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">Địa chỉ giao:</td><td>${order.customerAddress || 'Chưa cung cấp'}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;">Thanh toán:</td><td>${payStr}</td></tr>
              ${order.requestedDeliveryDate ? `<tr><td style="padding:4px 0;color:#6b7280;">Ngày giao:</td><td>${new Date(order.requestedDeliveryDate).toLocaleDateString('vi-VN')}</td></tr>` : ''}
            </table>
          </td>
        </tr>
        <!-- Items -->
        <tr>
          <td style="padding:0 32px 24px;">
            <h2 style="margin:0 0 14px;font-size:15px;color:#374151;">🥦 Danh Sách Sản Phẩm Đặt Hàng</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#f9fafb;color:#6b7280;font-size:12px;">
                  <th style="padding:8px 10px;text-align:left;">Sản phẩm</th>
                  <th style="padding:8px 10px;text-align:center;">Số lượng</th>
                  <th style="padding:8px 10px;text-align:right;">Đơn giá</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              ${totalRow}
            </table>
          </td>
        </tr>
        ${order.totalNote ? `<tr><td style="padding:0 32px 24px;"><div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:6px;font-size:14px;color:#92400e;"><strong>📝 Ghi chú:</strong> ${order.totalNote}</div></td></tr>` : ''}
        <!-- CTA -->
        <tr>
          <td style="padding:8px 32px 32px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/collections/orders"
               style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
              👉 Vào Admin Xử Lý Đơn
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Email tự động từ hệ thống HTX Rau Túy Loan · ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"🛒 Đơn Hàng Rau Túy Loan" <${smtpUser}>`,
      to: adminEmail,
      subject: `🆕 Đơn hàng mới ${order.orderCode} — ${order.customerName} (${order.customerPhone})`,
      html,
    });
  } catch (err) {
    console.error('[Email] Failed to send order notification:', err);
  }
}

/**
 * Telegram Order Notification
 * Gửi thông báo Telegram tới admin khi có đơn hàng mới
 * Cấu hình: TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID trong .env.local
 */

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function sendTelegramOrderNotification(order: {
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
  const token = settings?.payment?.notifications?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings?.payment?.notifications?.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;


  const paymentEmoji: Record<string, string> = {
    cod: '💵 Tiền mặt khi giao (COD)',
    qr: '🏦 Chuyển khoản QR',
    bank: '🏦 Chuyển khoản ngân hàng',
  };
  const paymentLabel = paymentEmoji[order.paymentMethod || 'cod'] || '💵 Tiền mặt khi giao (COD)';

  const itemLines = order.items
    .map((it, i) => {
      const name = it.productName || (it.product?.name || 'Sản phẩm') as string;
      const price = it.unitPrice ? ` — ${Number(it.unitPrice).toLocaleString('vi-VN')}đ/${it.unit}` : '';
      return `   ${i + 1}. <b>${name}</b> × ${it.quantity} ${it.unit}${price}`;
    })
    .join('\n');

  const total = order.totalAmount
    ? `\n💰 <b>Tổng tiền:</b> ${Number(order.totalAmount).toLocaleString('vi-VN')} đ`
    : '';

  const deliveryDate = order.requestedDeliveryDate
    ? `\n📅 <b>Ngày giao:</b> ${new Date(order.requestedDeliveryDate).toLocaleDateString('vi-VN')}`
    : '';

  const note = order.totalNote ? `\n📝 <b>Ghi chú:</b> ${order.totalNote}` : '';

  const text = `🛒 <b>ĐƠN HÀNG MỚI — HTX RAU TÚY LOAN</b>

🔖 <b>Mã đơn:</b> <code>${order.orderCode}</code>
👤 <b>Khách hàng:</b> ${order.customerName}
📞 <b>SĐT:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>
📍 <b>Địa chỉ:</b> ${order.customerAddress || 'Chưa cung cấp'}
💳 <b>Thanh toán:</b> ${paymentLabel}${deliveryDate}

🥦 <b>Danh sách đặt hàng:</b>
${itemLines}${total}${note}

⏰ <i>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</i>
👉 Vào admin xử lý: /admin/collections/orders`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('[Telegram] Failed to send order notification:', err);
  }
}

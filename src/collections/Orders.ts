import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Đơn Đặt Hàng',
    plural: 'Quản lý Đơn Hàng',
  },
  admin: {
    useAsTitle: 'orderCode',
    defaultColumns: ['orderCode', 'customerName', 'customerPhone', 'status', 'source', 'createdAt'],
    group: 'Kinh doanh',
    description: '👉 Quản lý đơn đặt hàng từ khách hàng qua website, điện thoại, Zalo, Facebook...',
    listSearchableFields: ['customerName', 'customerPhone', 'orderCode'],
    components: {
      beforeListTable: [
        '@/collections/components/ExportDeliveryButton#ExportDeliveryButton',
      ],
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // ─── Mã đơn hàng (Sidebar) ────────────────────────────────────────────────
    {
      name: 'orderCode',
      type: 'text',
      label: 'Mã đơn hàng',
      admin: {
        position: 'sidebar',
        description: 'Tự động tạo nếu để trống (VD: DH-20260821-001)',
      },
    },
    // ─── Trạng thái đơn (Sidebar) ─────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái đơn hàng',
      required: true,
      defaultValue: 'new',
      options: [
        { label: '🆕 Mới — Chưa xử lý', value: 'new' },
        { label: '📞 Đã liên hệ xác nhận', value: 'confirmed' },
        { label: '📦 Đang chuẩn bị hàng', value: 'preparing' },
        { label: '🚚 Đang giao hàng', value: 'delivering' },
        { label: '✅ Hoàn thành', value: 'done' },
        { label: '❌ Đã huỷ', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // ─── Nguồn đơn hàng (Sidebar) ─────────────────────────────────────────────
    {
      name: 'source',
      type: 'select',
      label: 'Nguồn đơn hàng',
      defaultValue: 'website',
      options: [
        { label: '🌐 Website', value: 'website' },
        { label: '💬 Zalo', value: 'zalo' },
        { label: '📘 Facebook', value: 'facebook' },
        { label: '📞 Điện thoại', value: 'phone' },
        { label: '🚶 Khách trực tiếp', value: 'direct' },
        { label: '📋 Khác', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // ─── Phương thức thanh toán (Sidebar) ────────────────────────────────────
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Phương thức thanh toán',
      defaultValue: 'cod',
      options: [
        { label: '💵 Tiền mặt khi giao (COD)', value: 'cod' },
        { label: '🏦 Chuyển khoản QR ngân hàng', value: 'qr' },
        { label: '📞 Điện thoại / Zalo', value: 'phone' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'customerName',
          type: 'text',
          required: true,
          label: 'Tên khách hàng',
          admin: {
            placeholder: 'VD: Nguyễn Văn An',
          },
        },
        {
          name: 'customerPhone',
          type: 'text',
          required: true,
          label: 'Số điện thoại',
          admin: {
            placeholder: 'VD: 0901234567',
          },
        },
      ],
    },
    {
      name: 'customerAddress',
      type: 'text',
      label: 'Địa chỉ giao hàng',
      admin: {
        placeholder: 'VD: 123 Đường Trần Phú, P. An Khê, Q. Thanh Khê, Đà Nẵng',
      },
    },
    // ─── Danh sách sản phẩm ───────────────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      label: '🛒 Danh sách sản phẩm đặt hàng',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'product',
              type: 'relationship',
              relationTo: 'products',
              label: 'Sản phẩm rau',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'productName',
              type: 'text',
              label: 'Tên SP (ghi tay nếu không có trong danh mục)',
              admin: {
                width: '50%',
                placeholder: 'VD: Cải xanh, Rau muống...',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              type: 'number',
              required: true,
              label: 'Số lượng',
              defaultValue: 1,
              min: 0.1,
              admin: {
                width: '30%',
              },
            },
            {
              name: 'unit',
              type: 'select',
              label: 'Đơn vị',
              defaultValue: 'kg',
              options: [
                { label: 'kg', value: 'kg' },
                { label: 'gram', value: 'gram' },
                { label: 'bó', value: 'bo' },
                { label: 'hộp', value: 'hop' },
                { label: 'túi', value: 'tui' },
                { label: 'cái', value: 'cai' },
                { label: 'khay', value: 'khay' },
              ],
              admin: {
                width: '30%',
              },
            },
            {
              name: 'unitPrice',
              type: 'number',
              label: 'Đơn giá (VNĐ)',
              admin: {
                width: '40%',
                placeholder: 'VD: 25000',
                description: 'Giá tại thời điểm đặt hàng',
              },
            },
          ],
        },
        {
          name: 'itemNote',
          type: 'text',
          label: 'Ghi chú mặt hàng',
          admin: {
            placeholder: 'VD: Rau non, cần ít thuốc...',
          },
        },
      ],
    },
    // ─── Ghi chú đơn hàng ─────────────────────────────────────────────────────
    {
      name: 'totalNote',
      type: 'textarea',
      label: '📝 Ghi chú chung cho đơn hàng',
      admin: {
        placeholder: 'VD: Giao trước 7h sáng, để ở cổng. Khách cần hóa đơn...',
      },
    },
    // ─── Ngày giao hàng mong muốn ─────────────────────────────────────────────
    {
      name: 'requestedDeliveryDate',
      type: 'date',
      label: 'Ngày giao hàng mong muốn',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    // ─── Tổng tiền (tính tay) ─────────────────────────────────────────────────
    {
      name: 'totalAmount',
      type: 'number',
      label: 'Tổng tiền đơn hàng (VNĐ)',
      admin: {
        position: 'sidebar',
        description: 'Nhập thủ công sau khi xác nhận giá với khách.',
      },
    },
    // ─── Nhân viên xử lý ─────────────────────────────────────────────────────
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: 'Nhân viên phụ trách',
      admin: {
        position: 'sidebar',
        description: 'Người chịu trách nhiệm xử lý đơn hàng này.',
      },
    },
  ],
    hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Tự động tạo mã đơn hàng nếu chưa có
        if (operation === 'create' && !data.orderCode) {
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          const rand = Math.floor(Math.random() * 9000) + 1000;
          data.orderCode = `DH-${y}${m}${d}-${rand}`;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Chỉ thông báo khi tạo đơn mới từ Payload Admin (đơn từ API đã notify riêng)
        if (operation !== 'create') return doc;
        // Chỉ gửi nếu nguồn là admin (không phải website — website đã tự notify)
        if (doc.source === 'website') return doc;

        try {
          const { sendTelegramOrderNotification } = await import('@/lib/telegramNotify');
          const { sendEmailOrderNotification } = await import('@/lib/emailNotify');
          const notif = {
            orderCode: doc.orderCode,
            customerName: doc.customerName,
            customerPhone: doc.customerPhone,
            customerAddress: doc.customerAddress,
            items: doc.items || [],
            totalAmount: doc.totalAmount,
            totalNote: doc.totalNote,
            paymentMethod: doc.paymentMethod,
            requestedDeliveryDate: doc.requestedDeliveryDate,
          };
          sendTelegramOrderNotification(notif).catch(() => {});
          sendEmailOrderNotification(notif).catch(() => {});
        } catch (_err) {
          // Không crash nếu notify lỗi
        }
        return doc;
      },
    ],
  },
};


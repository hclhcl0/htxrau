import type { CollectionConfig } from 'payload';

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: {
    singular: 'Chứng nhận',
    plural: 'Chứng nhận & Kiểm định ATVSTP',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'code', 'issuer', 'issuedDate', 'expiryDate'],
    group: 'Quản lý Nông Sản',
    description: '👉 Quản lý các chứng nhận VietGAP, GlobalGAP, kết quả xét nghiệm ATVSTP. Hiển thị tại: /chung-nhan',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên chứng nhận / Kết quả kiểm nghiệm',
      admin: {
        placeholder: 'VD: Giấy chứng nhận VietGAP số 2026/NN-VG, Kết quả xét nghiệm dư lượng thuốc BVTV...',
      },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Số hiệu chứng chỉ / Mã truy xuất',
      admin: {
        placeholder: 'VD: VG-2026-08819',
      },
    },
    {
      name: 'issuer',
      type: 'text',
      required: true,
      label: 'Cơ quan / Tổ chức chứng nhận',
      defaultValue: 'Tổ chức Chứng nhận Nông nghiệp VietGAP',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'issuedDate',
          type: 'date',
          label: 'Ngày cấp',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd/MM/yyyy',
            },
          },
        },
        {
          name: 'expiryDate',
          type: 'date',
          label: 'Ngày hết hạn',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd/MM/yyyy',
            },
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Ảnh chụp Giấy chứng nhận (Scan/Hình ảnh)',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: 'File PDF chi tiết (Nếu có)',
    },
    {
      name: 'scope',
      type: 'text',
      label: 'Phạm vi chứng nhận',
      defaultValue: 'Sản xuất và sơ chế các loại rau, củ, quả an toàn theo tiêu chuẩn VietGAP',
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Ghi chú & Tóm tắt kết quả',
    },
    {
      name: 'orderNum',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};

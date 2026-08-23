import type { CollectionConfig } from 'payload';

export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: {
    singular: 'Banner quảng cáo',
    plural: 'Danh sách Banner',
  },
  admin: {
    group: 'Tài nguyên & Giao diện',
    useAsTitle: 'title',
    defaultColumns: ['title', 'position', 'order', 'isActive'],
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
      label: 'Tiêu đề Banner',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Hình ảnh Banner',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Đường dẫn khi Click (Không bắt buộc)',
      admin: {
        description: 'Nhập đường dẫn để khách hàng click vào banner. Dùng link nội bộ (VD: /goi-vac-xin, /cam-nang) hoặc link web khác (VD: https://facebook.com/...)',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Thứ tự hiển thị',
      admin: {
        description: 'Banner có số nhỏ hơn sẽ hiển thị trước (0, 1, 2...)',
        position: 'sidebar',
      },
    },
    {
      name: 'position',
      type: 'select',
      defaultValue: 'home_slider',
      options: [
        { label: 'Slider Trang chủ (URL: /)', value: 'home_slider' },
        { label: 'Banner Trang Sản Phẩm Rau Sạch (URL: /san-pham)', value: 'products_banner' },
        { label: 'Banner Trang Combo Giỏ Rau (URL: /combo-rau)', value: 'combo_banner' },
        { label: 'Cột bên phải (Sidebar)', value: 'sidebar' },
        { label: 'Dưới cùng trang (Footer)', value: 'footer' },
      ],
      label: 'Vị trí hiển thị',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'size',
      type: 'select',
      label: 'Kích thước hiển thị',
      options: [
        { label: 'Nhỏ', value: 'small' },
        { label: 'Vừa', value: 'medium' },
        { label: 'Lớn', value: 'large' },
        { label: 'Tùy chỉnh', value: 'custom' },
      ],
      defaultValue: 'medium',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'customHeight',
      type: 'number',
      label: 'Chiều cao tự gõ (px)',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Mở đường dẫn ở Tab mới',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Kích hoạt / Hiển thị Banner',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'mobileImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hình ảnh dành cho Điện thoại (Không bắt buộc)',
      admin: {
        description: 'Nếu tải lên, ảnh này sẽ thay thế ảnh Banner chính khi xem trên màn hình điện thoại (Mobile)',
      },
    },
  ],
};

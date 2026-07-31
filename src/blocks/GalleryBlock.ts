import type { Block } from 'payload';

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  labels: {
    singular: 'Thư viện ảnh',
    plural: 'Thư viện ảnh',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Lưới (Grid)', value: 'grid' },
        { label: 'Thanh trượt (Slider / Carousel)', value: 'slider' },
      ],
      label: 'Kiểu hiển thị',
    },
    {
      // hasMany: true → Admin hiện multi-select picker, chọn nhiều ảnh cùng lúc
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      label: 'Hình ảnh (giữ Ctrl/Cmd để chọn nhiều cùng lúc)',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Tìm kiếm và chọn nhiều ảnh cùng lúc từ thư viện.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Chú thích bộ ảnh (không bắt buộc)',
    },
  ],
};

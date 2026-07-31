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
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Hình ảnh',
      admin: {
        description: 'Nhấn "Add Media" để mở thư viện, giữ Ctrl/Shift để chọn nhiều ảnh cùng lúc.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Chú thích bộ ảnh (không bắt buộc)',
    },
  ],
};

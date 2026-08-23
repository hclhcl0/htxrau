import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Chuyên mục',
    plural: 'Chuyên mục bài viết',
  },
  admin: {
    description: '👉 Đường dẫn xem trên website: /[slug]',
    useAsTitle: 'name',
    defaultColumns: ['name', 'orderNum'],
    group: 'Tin tức & Nội dung',
  },
  defaultSort: '-orderNum',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên chuyên mục',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Đường dẫn tĩnh (Slug)',
      required: true,
      unique: true,
      admin: {
        components: {
          Field: '@/components/SlugField.tsx#SlugField',
        },
        description: 'Đường dẫn tĩnh (VD: tin-tuc-su-kien)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Chuyên mục cha',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh bìa (Banner)',
      admin: {
        description: 'Ảnh ngang khổ lớn (VD: 1920x500) hiển thị phía trên cùng của trang chuyên mục.',
      }
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Biểu tượng (Icon/Emoji)',
      admin: {
        position: 'sidebar',
        description: 'Emoji đại diện (VD: 🌱 Rau, 🥕 Củ quả, 🍄 Nấm...)',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Màu chủ đề (Hex)',
      admin: {
        position: 'sidebar',
        description: 'Mã màu hex (VD: #E53E3E, #38A169...) dùng làm màu thẻ chủ đề',
      },
    },
    {
      name: 'orderNum',
      type: 'number',
      label: 'Thứ tự sắp xếp',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};

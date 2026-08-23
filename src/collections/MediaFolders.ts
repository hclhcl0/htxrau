import type { CollectionConfig } from 'payload';

export const MediaFolders: CollectionConfig = {
  slug: 'media-folders',
  labels: {
    singular: 'Thư mục phương tiện',
    plural: 'Thư mục phương tiện',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên thư mục',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'media-folders',
      label: 'Thư mục cha',
      admin: {
        description: 'Chọn thư mục cha nếu đây là thư mục con. Bỏ trống nếu là thư mục gốc.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả',
      required: false,
    },
  ],
};

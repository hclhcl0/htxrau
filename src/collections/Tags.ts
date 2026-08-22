import type { CollectionConfig } from 'payload';

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Thẻ / Từ khóa',
    plural: 'Thẻ / Từ khóa',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Tin tức & Nội dung',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor', 'moderator', 'author'].includes(user?.role as string),
    update: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
    delete: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Từ khóa',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Đường dẫn tĩnh',
    },
  ],
};

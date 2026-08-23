import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Tài khoản',
    plural: 'Danh sách tài khoản',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Quản trị hệ thống',
    components: {
      beforeList: [
        '@/components/Admin/UserPermissionsNote.tsx#UserPermissionsNote',
      ],
    },
  },
  auth: {
    maxLoginAttempts: 10000, // Tạm thời vô hiệu hóa khóa tài khoản do bot tấn công
    cookies: {
      secure: process.env.NODE_ENV === 'production', // HTTPS production
      sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'Lax',
    },
    tokenExpiration: 28800, // 8 tiếng
  },
  access: {
    admin: () => true,
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      label: 'Vai trò / Quyền hạn',
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Quản trị viên (Admin)', value: 'admin' },
        { label: 'Kiểm duyệt viên (Moderator)', value: 'moderator' },
        { label: 'Biên tập viên (Editor)', value: 'editor' },
        { label: 'Cộng tác viên/Tác giả (Author)', value: 'author' },
        { label: 'Người dùng (User)', value: 'user' },
      ],
      access: {
        update: () => true,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Họ và tên',
    },
    {
      name: 'allowedCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Chuyên mục được phân công',
      admin: {
        description: 'Để trống = không giới hạn chuyên mục (xem/sửa tất cả). Áp dụng cho Editor, Moderator và Author.',
        position: 'sidebar',
        condition: (data: any) => ['editor', 'moderator', 'author'].includes(data?.role),
      },
    },
  ],
};

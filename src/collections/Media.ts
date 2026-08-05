import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Tệp phương tiện',
    plural: 'Thư viện phương tiện',
  },
  admin: {
    group: 'Nội dung',
    components: {
      beforeListTable: [
        '@/components/Admin/MediaFolderFilter#MediaFolderFilter',
      ],
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user), // Mọi user đăng nhập đều được upload
    update: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role as string),
    delete: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role as string),
  },
  upload: {
    staticDir: 'media',
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: null,
        position: 'centre',
      },
      {
        name: 'zalo',
        width: 1024,
        height: null,
        position: 'centre',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
        generateImageName: ({ originalName, sizeName }) => {
          const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
          return `${nameWithoutExt}-${sizeName}.jpg`;
        }
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-cfb',
      'application/rtf',
      'text/plain',
      'text/csv',
      'video/*',
      'audio/*'
    ],
  },
  fields: [
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'media-folders',
      label: 'Thư mục',
      admin: {
        position: 'sidebar',
        description: 'Chọn thư mục để lưu trữ phương tiện này.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: false,
      label: 'Mô tả Alt (SEO/Accessibility)',
      admin: {
        description: 'Nếu bỏ trống, hệ thống sẽ tự động tạo thẻ Alt dựa trên tên bài viết hoặc thông tin mặc định.',
      }
    },
  ],
};

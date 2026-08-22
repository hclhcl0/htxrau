import type { CollectionConfig } from 'payload';

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Video',
    plural: 'Thư viện Video',
  },
  admin: {
    description: '👉 Đường dẫn xem trên website: /video',
    useAsTitle: 'title',
    defaultColumns: ['title', 'platform', 'channel', 'publishedDate'],
    group: 'Thư viện Video',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    update: ({ req: { user } }) => ['admin', 'editor', 'moderator'].includes(user?.role as string),
    delete: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: false,
      label: 'Tiêu đề video (Tự động lấy từ YouTube nếu để trống)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Nền tảng',
          defaultValue: 'youtube',
          options: [
            { label: '🔴 YouTube', value: 'youtube' },
            { label: '🔵 Facebook', value: 'facebook' },
            { label: '⬛ TikTok', value: 'tiktok' },
          ],
        },
        {
          name: 'channel',
          type: 'relationship',
          relationTo: 'video-channels',
          label: 'Kênh',
          filterOptions: ({ data }: any) => {
            if (!data?.platform) return true;
            return { platform: { equals: data.platform } };
          },
        },
      ],
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: 'Link Video',
      admin: {
        description:
          'Dán link đầy đủ của video từ YouTube / Facebook / TikTok vào đây. VD: https://www.youtube.com/watch?v=abc123',
      },
    },
    {
      name: 'embedCode',
      type: 'textarea',
      label: 'Mã nhúng (Embed Code) — dành cho TikTok',
      admin: {
        description:
          'Chỉ cần với video TikTok: Vào TikTok → Chia sẻ → Nhúng → Copy mã và dán vào đây.',
        condition: (data: any) => data?.platform === 'tiktok',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh bìa tùy chỉnh',
      admin: {
        description:
          'Tùy chọn. Nếu để trống: YouTube tự lấy ảnh từ API, Facebook/TikTok sẽ hiển thị biểu tượng nền tảng.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'publishedDate',
          type: 'date',
          label: 'Ngày xuất bản',
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Video nổi bật',
          defaultValue: false,
        },
        {
          name: 'isAIGenerated',
          type: 'checkbox',
          label: 'Video có sử dụng AI',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Sản phẩm rau liên quan',
      admin: {
        description: 'Chọn các loại rau xuất hiện trong video này (tùy chọn).',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data.videoUrl && data.platform === 'youtube') {
          if (!data.title || !data.description) {
            try {
              const res = await fetch(data.videoUrl);
              const text = await res.text();
              const titleMatch = text.match(/<meta name="title" content="([^"]+)">/) || text.match(/<meta property="og:title" content="([^"]+)">/);
              const descMatch = text.match(/<meta name="description" content="([^"]+)">/) || text.match(/<meta property="og:description" content="([^"]+)">/);
              
              if (!data.title && titleMatch) {
                data.title = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
              }
              if (!data.description && descMatch) {
                data.description = descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
              }
            } catch (error) {
              console.error("Error fetching YouTube metadata", error);
            }
          }
        }
        
        // Ensure title has a fallback if still empty
        if (!data.title) {
          data.title = "Video không có tiêu đề";
        }
        
        return data;
      },
    ],
  },
};

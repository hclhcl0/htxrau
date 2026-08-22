import type { CollectionConfig } from 'payload';
import { lexicalEditor, FixedToolbarFeature, HeadingFeature, AlignFeature, HTMLConverterFeature, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { ImageLinkBlock } from '../blocks/ImageLinkBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { FileDownloadsBlock } from '../blocks/FileDownloadsBlock.ts';
import { SliderBlock } from '../blocks/SliderBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';

/**
 * Trích xuất danh sách ID chuyên mục được phân công của user.
 * Trả về mảng ID nếu có, hoặc null nếu không giới hạn (để trống).
 */
function getAllowedCategoryIds(user: any): string[] | null {
  const cats = user?.allowedCategories as any[] | undefined;
  if (!cats || cats.length === 0) return null; // null = không giới hạn
  return cats.map((c: any) => (typeof c === 'string' ? c : c?.id)).filter(Boolean);
}

/**
 * Tạo Payload query filter theo danh sách chuyên mục.
 * Dùng cho các vai trò cần lọc theo chuyên mục (Editor, Moderator, Author).
 */
function buildCategoryFilter(allowedIds: string[], userId: string | number, includeOwn: boolean) {
  const categoryCondition = { category: { in: allowedIds } };
  if (!includeOwn) return categoryCondition; // Moderator/Editor: chỉ lọc category
  // Author: xem bài trong chuyên mục OR bài nháp của chính mình
  return {
    or: [
      { category: { in: allowedIds } },
      { author: { equals: userId } },
    ],
  };
}





export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Bài viết',
    plural: 'Danh sách bài viết',
  },
  admin: {
    description: '👉 Đường dẫn xem trên website: /bai-viet/[slug]',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'reviewStatus', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'slug', 'description', 'author_name'],
    group: 'Tin tức & Nội dung',
    preview: (doc) => {
      if (doc?.slug) {
        return `/bai-viet/${doc.slug}?preview=true`;
      }
      return null;
    },
  },
  access: {
    // ─── READ ────────────────────────────────────────────────────────────────
    read: ({ req: { user } }) => {
      const role = user ? (Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase()) : null;
      
      // Admin: xem tất cả, không giới hạn
      if (role === 'admin') return true;

      // Editor & Moderator: xem tất cả HOẶC chỉ chuyên mục được phân công
      if (user && ['editor', 'moderator'].includes(role as string)) {
        const allowedIds = getAllowedCategoryIds(user);
        if (!allowedIds) return true; // Không giới hạn nếu để trống
        // Lọc theo chuyên mục (kể cả bài nháp trong chuyên mục đó)
        return buildCategoryFilter(allowedIds, user.id, false);
      }

      // Author: xem bài trong chuyên mục được phân công + bài nháp của chính mình
      if (role === 'author') {
        const allowedIds = getAllowedCategoryIds(user);
        if (allowedIds) {
          return buildCategoryFilter(allowedIds, user.id, true);
        }
        // Chưa phân chuyên mục: xem bài public + bài nháp của mình
        return {
          or: [
            { _status: { equals: 'published' } },
            { author: { equals: user.id } },
          ],
        };
      }

      // Public / Guest: chỉ bài đã xuất bản
      return { _status: { equals: 'published' } };
    },

    // ─── CREATE ───────────────────────────────────────────────────────────────
    create: ({ req: { user } }) => {
      if (!user) return false;
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      return ['admin', 'editor', 'moderator', 'author'].includes(role as string);
    },

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    update: ({ req: { user } }) => {
      if (!user) return false;
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      
      // Admin: sửa tất cả
      if (role === 'admin') return true;

      // Editor & Moderator: sửa tất cả HOẶC chỉ chuyên mục được phân công
      if (['editor', 'moderator'].includes(role as string)) {
        const allowedIds = getAllowedCategoryIds(user);
        if (!allowedIds) return true; // Không giới hạn
        return { category: { in: allowedIds } };
      }

      // Author: chỉ sửa bài của chính mình
      return { author: { equals: user.id } };
    },

    // ─── DELETE ───────────────────────────────────────────────────────────────
    delete: ({ req: { user } }) => {
      if (!user) return false;
      const role = Array.isArray(user.role) ? user.role[0]?.toLowerCase() : user.role?.toLowerCase();
      
      // Admin: xóa tất cả
      if (role === 'admin') return true;

      // Editor: xóa tất cả HOẶC chỉ chuyên mục được phân công
      if (role === 'editor') {
        const allowedIds = getAllowedCategoryIds(user);
        if (!allowedIds) return true; // Không giới hạn
        return { category: { in: allowedIds } };
      }

      // Moderator: KHÔNG được xóa bài (dù có phân chuyên mục hay không)
      if (role === 'moderator') return false;

      // Author: chỉ xóa bài nháp của chính mình
      return { author: { equals: user.id } };
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {

    beforeChange: [
      ({ req: { user }, data, operation }) => {
        // Tự động điền publishedAt cho các bài viết mới nếu chưa có
        if (operation === 'create' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        if (operation === 'update' && data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        // Author không được tự xuất bản (publish)
        if (user && user.role === 'author') {
          if (data._status === 'published') {
            data._status = 'draft';
          }
          // Author chỉ được đặt reviewStatus là draft hoặc pending_review
          if (data.reviewStatus && !['draft', 'pending_review'].includes(data.reviewStatus)) {
            data.reviewStatus = 'draft';
          }
        }
        return data;
      },
      // Validate chuyên mục được phép cho Author
      async ({ req, data, operation }) => {
        if (req.user?.role === 'author') {
          const allowedCategories = (req.user as any)?.allowedCategories;
          if (allowedCategories && allowedCategories.length > 0) {
            const allowedIds = allowedCategories.map((c: any) =>
              typeof c === 'string' ? c : c?.id
            );
            
            if (data.category) {
              const categoryId = typeof data.category === 'string' ? data.category : (data.category as any)?.id;
              if (categoryId && !allowedIds.includes(categoryId)) {
                throw new Error('Bạn chỉ được phép viết bài trong các chuyên mục đã được phân công. Vui lòng chọn đúng chuyên mục.');
              }
            }
          }
        }
        return data;
      },
      // Extract first image from content if no image is provided
      async ({ data }) => {
        if (!data.image && data.content && data.content.root) {
          // Recursive function to find first upload block
          const findFirstImage = (nodes: any[]): any => {
            for (const node of nodes) {
              if (node.type === 'upload' && node.relationTo === 'media') {
                return node.value?.id || node.value;
              }
              if (node.children) {
                const found = findFirstImage(node.children);
                if (found) return found;
              }
            }
            return null;
          };
          
          const firstImageId = findFirstImage(data.content.root.children || []);
          if (firstImageId) {
            data.image = firstImageId;
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'isPinned',
      type: 'checkbox',
      label: '📌 Ghim bài viết lên đầu',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Bài được ghim sẽ luôn hiển thị trên cùng trong danh sách.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề bài viết',
    },
    {
      name: 'publishedAt', type: 'date', index: true,
      label: 'Ngày xuất bản',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => {
          const role = Array.isArray(user?.role) ? user.role[0]?.toLowerCase() : user?.role?.toLowerCase();
          return role === 'admin' || role === 'editor';
        },
      },
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
        description: 'Đường dẫn tĩnh (VD: ten-bai-viet)',
      },
    },
    {
      name: 'category', type: 'relationship', relationTo: 'categories', index: true,
      hasMany: false,
      required: true,
      label: 'Chuyên mục',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn (Trích dẫn)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện (Thumbnail)',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Tác giả',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            if (operation === 'create' && req.user && !value) {
              return req.user.id;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      label: 'Trạng thái duyệt bài',
      defaultValue: 'draft',
      options: [
        { label: '📝 Đang soạn thảo', value: 'draft' },
        { label: '⏳ Chờ biên tập duyệt', value: 'pending_review' },
        { label: '✅ Đã duyệt – Sẵn sàng xuất bản', value: 'approved' },
        { label: '❌ Bị từ chối', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Tác giả chuyển sang "Chờ duyệt" khi hoàn tất. Biên tập/Quản trị xét duyệt và xuất bản.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'] }),
          AlignFeature(),
          HTMLConverterFeature({}),
          BlocksFeature({ blocks: [
            VideoBlock, TikTokBlock, PDFBlock, GalleryBlock, CalloutBlock, ButtonBlock, ImageLinkBlock, RelatedArticlesBlock, ColumnsBlock,
            EmbedBlock, CardBlock,
            FileDownloadsBlock, SliderBlock,
          ] }),
        ]
      }),
      required: true,
      label: 'Nội dung chi tiết',
    },
    {
      name: 'author_name',
      type: 'text',
      label: 'Tên tác giả',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'Lượt xem',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => {
          const role = Array.isArray(user?.role) ? user.role[0]?.toLowerCase() : user?.role?.toLowerCase();
          return role === 'admin' || role === 'editor';
        },
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Từ khóa',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};

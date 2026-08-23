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
    defaultColumns: ['title', 'slug', 'category', 'reviewStatus', 'publishedAt'],
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
    read: () => true,

    // ─── CREATE ───────────────────────────────────────────────────────────────
    create: ({ req: { user } }) => Boolean(user),

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    update: ({ req: { user } }) => Boolean(user),

    // ─── DELETE ───────────────────────────────────────────────────────────────
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: true,
  },
  hooks: {

    beforeChange: [
      ({ data, operation }) => {
        // Tự động điền publishedAt cho các bài viết mới nếu chưa có
        if (operation === 'create' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        if (operation === 'update' && data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
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

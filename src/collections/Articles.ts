import type { CollectionConfig } from 'payload';
import { lexicalEditor, FixedToolbarFeature, HeadingFeature, AlignFeature, HTMLConverterFeature, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { NewsListBlockStub, ExternalLinksBlockStub } from '../blocks/OrphanStubs.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { TableBlock } from '../blocks/TableBlock.ts';
import { ExcelTableBlock } from '../blocks/ExcelTableBlock.ts';
import { FaqBlock } from '../blocks/FaqBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { QuoteBlock } from '../blocks/QuoteBlock.ts';
import { AudioBlock } from '../blocks/AudioBlock.ts';
import { FileDownloadsBlock } from '../blocks/FileDownloadsBlock.ts';
import { SliderBlock } from '../blocks/SliderBlock.ts';
import { InfographicBlock } from '../blocks/InfographicBlock.ts';
import { ZaloWidgetBlock } from '../blocks/ZaloWidgetBlock.ts';
import { LivestreamBlock } from '../blocks/LivestreamBlock.ts';
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
  const categoryCondition = { 
    or: [
      { category: { in: allowedIds } },
      { additionalCategories: { in: allowedIds } }
    ] 
  };
  if (!includeOwn) return categoryCondition; // Moderator/Editor: chỉ lọc category
  // Author: xem bài trong chuyên mục OR bài nháp của chính mình
  return {
    or: [
      { category: { in: allowedIds } },
      { additionalCategories: { in: allowedIds } },
      { author: { equals: userId } },
    ],
  };
}

/**
 * Chuyển đổi cây Lexical node sang HTML đơn giản để gửi qua webhook Zalo OA.
 * Chỉ xử lý các node cơ bản: paragraph, heading, text, list, upload (image).
 */
function lexicalNodesToHtml(nodes: any[], baseUrl: string): string {
  if (!Array.isArray(nodes)) return '';

  return nodes.map((node) => {
    const type = node.type;
    const children = node.children || [];

    switch (type) {
      case 'paragraph': {
        const inner = lexicalNodesToHtml(children, baseUrl);
        return inner.trim() ? `<p>${inner}</p>` : '';
      }
      case 'heading': {
        const inner = lexicalNodesToHtml(children, baseUrl);
        return `<b>${inner}</b><br>`;
      }
      case 'text': {
        let text = node.text || '';
        if (!text) return '';
        // Escape HTML
        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (node.format) {
          if (node.format & 1) text = `<b>${text}</b>`;   // Bold
          if (node.format & 2) text = `<i>${text}</i>`;   // Italic
        }
        return text;
      }
      case 'link': {
        const inner = lexicalNodesToHtml(children, baseUrl);
        const url = node.fields?.url || node.url || '#';
        return `<a href="${url}">${inner}</a>`;
      }
      case 'list': {
        const tag = node.listType === 'number' ? 'ol' : 'ul';
        const items = lexicalNodesToHtml(children, baseUrl);
        return `<${tag}>${items}</${tag}>`;
      }
      case 'listitem': {
        const inner = lexicalNodesToHtml(children, baseUrl);
        return `<li>${inner}</li>`;
      }
      case 'upload': {
        // Hình ảnh inline
        if (node.relationTo === 'media' && node.value) {
          const imgUrl = typeof node.value === 'object'
            ? (node.value.url?.startsWith('/') ? `${baseUrl}${node.value.url}` : node.value.url)
            : '';
          if (imgUrl) {
            const alt = node.value?.alt || '';
            return `<img src="${imgUrl}" alt="${alt}">`;
          }
        }
        return '';
      }
      case 'horizontalrule':
        return '<br>';
      case 'linebreak':
        return '<br>';
      case 'block': {
        // Custom blocks: chỉ lấy text nếu có caption
        const blockData = node.fields || {};
        const caption = blockData.caption || blockData.title || '';
        return caption ? `<p><i>${caption}</i></p>` : '';
      }
      default:
        // Đệ quy với children nếu có
        return children.length > 0 ? lexicalNodesToHtml(children, baseUrl) : '';
    }
  }).join('');
}



export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Bài viết',
    plural: 'Danh sách bài viết',
  },
  admin: {
    description: '👉 Đường dẫn xem trên website: /bai-viet/[slug] hoặc /suc-khoe/...',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'reviewStatus', '_status', 'publishedAt'],
    listSearchableFields: ['title', 'slug', 'description', 'author_name'],
    group: 'Nội dung',
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
        return { or: [{ category: { in: allowedIds } }, { additionalCategories: { in: allowedIds } }] };
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
        return { or: [{ category: { in: allowedIds } }, { additionalCategories: { in: allowedIds } }] };
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
    beforeOperation: [
      ({ args, operation }) => {
        // Fix cho Zalo Mini App (Mini App đang hardcode sort=-publishedAt)
        // Nếu bài viết không có publishedAt thì sẽ không hiện lên đầu.
        // Ta ghi đè sort thành -createdAt để trả về bài mới nhất
        if (operation === 'read' && args.sort === '-publishedAt') {
          args.sort = '-createdAt';
        }
        return args;
      }
    ],
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
            if (data.additionalCategories) {
              const addCats = Array.isArray(data.additionalCategories) ? data.additionalCategories : [];
              for (const ac of addCats) {
                const acId = typeof ac === 'string' ? ac : ac?.id;
                if (acId && !allowedIds.includes(acId)) {
                  throw new Error('Bạn chọn chuyên mục phụ không nằm trong quyền hạn.');
                }
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
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Trigger khi bài ở trạng thái published VÀ checkbox autoZaloBroadcast được bật
        if (
          doc._status === 'published' &&
          doc.autoZaloBroadcast
        ) {
          try {
            // Đọc cấu hình từ biến môi trường (thêm vào .env của Payload CMS)
            const webhookUrl = process.env.ZALO_ADMIN_WEBHOOK_URL?.trim();
            const webhookSecret = process.env.ZALO_ADMIN_WEBHOOK_SECRET?.trim();

            if (!webhookUrl || !webhookSecret) {
              console.warn('[Auto Broadcast] Chưa cấu hình ZALO_ADMIN_WEBHOOK_URL hoặc ZALO_ADMIN_WEBHOOK_SECRET trong .env');
              return doc;
            }

            // Resolve image URL
            const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
            const imgField = doc.image && typeof doc.image === 'object' ? doc.image : null;
            const imgPath = imgField?.sizes?.card?.url || imgField?.url || '';
            const coverUrl = imgPath.startsWith('/') ? `${baseUrl}${imgPath}` : imgPath;

            // Convert Lexical JSON content sang HTML để gửi kèm webhook
            let htmlContent = '';
            try {
              if (doc.content?.root) {
                htmlContent = lexicalNodesToHtml(doc.content.root.children || [], baseUrl);
              }
            } catch (e) {
              console.warn('[Auto Broadcast] Không chuyển đổi được content sang HTML:', e);
            }

            // Gọi webhook đến Zalo Admin (fire-and-forget, không block response)
            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: doc.title,
                slug: doc.slug,
                description: doc.description || '',
                imageUrl: coverUrl,
                htmlContent,
                webhookSecret,
              }),
            }).catch((err: Error) =>
              console.error('[Auto Broadcast] Webhook call thất bại:', err.message)
            );

            console.log(`[Auto Broadcast] Đã gửi webhook cho bài "${doc.title}" (slug: ${doc.slug})`);
          } catch (e) {
            console.error('[Auto Broadcast] Lỗi:', e);
          }
        }
        return doc;
      }
    ],
  },
  fields: [
    {
      name: 'autoZaloBroadcast',
      type: 'checkbox',
      label: 'Tự động gửi lên Zalo OA ngay khi xuất bản',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Chỉ có tác dụng khi trạng thái bài viết chuyển sang Đã xuất bản.',
      },
    },
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
      label: 'Ngày đăng (từ NukeViet)',
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
      name: 'additionalCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Các chuyên mục phụ',
      admin: {
        description: 'Bài viết sẽ được hiển thị thêm ở các chuyên mục phụ này.',
      },
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
            VideoBlock, TikTokBlock, PDFBlock, GalleryBlock, CalloutBlock, ButtonBlock, RelatedArticlesBlock, ColumnsBlock,
            TableBlock, ExcelTableBlock, FaqBlock, EmbedBlock, QuoteBlock, AudioBlock,
            FileDownloadsBlock, SliderBlock, InfographicBlock, ZaloWidgetBlock, LivestreamBlock,
            NewsListBlockStub, ExternalLinksBlockStub
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

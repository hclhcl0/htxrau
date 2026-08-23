import type { CollectionConfig } from 'payload';
import { HeroBannerBlock } from '../blocks/HeroBanner';
import { CategoryNewsBlock } from '../blocks/CategoryNews';
import { ColumnsBlock } from '../blocks/ColumnsBlock';
import { CalloutBlock } from '../blocks/CalloutBlock';
import { ButtonBlock } from '../blocks/ButtonBlock';
import { VideoBlock } from '../blocks/VideoBlock';
import { TikTokBlock } from '../blocks/TikTokBlock';
import { PDFBlock } from '../blocks/PDFBlock';
import { GalleryBlock } from '../blocks/GalleryBlock';
import { CardBlock } from '../blocks/CardBlock';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock';
import { RichTextBlock } from '../blocks/RichTextBlock';
import { SectionTitleBlock } from '../blocks/SectionTitleBlock';
import { CardGridBlock } from '../blocks/CardGridBlock';
import { StepsBlock } from '../blocks/StepsBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { CtaBannerBlock } from '../blocks/CtaBannerBlock';
import { EmbedBlock } from '../blocks/EmbedBlock';
import { FileDownloadsBlock } from '../blocks/FileDownloadsBlock';
import { SliderBlock } from '../blocks/SliderBlock';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Trang nội dung',
    plural: 'Các trang nội dung',
  },
  admin: {
    description: '👉 Đường dẫn xem trên website: /[slug]',
    useAsTitle: 'title',
    group: 'Nội dung',
    defaultColumns: ['title', 'slug', 'pageType', 'updatedAt'],
    preview: (doc) => {
      if (doc?.slug) {
        return '/' + doc.slug + '?preview=true';
      }
      return null;
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
    update: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin') || (Array.isArray(user?.role) ? user.role.includes('editor') : user?.role === 'editor'),
    delete: ({ req: { user } }) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin'),
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề trang',
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
        description: 'Đường dẫn URL (VD: gioi-thieu → /gioi-thieu)',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      label: 'Loại trang',
      defaultValue: 'standard',
      options: [
        { label: '📄 Trang thông tin chuẩn', value: 'standard' },
        { label: '🌿 Trang Giới thiệu nông trại / Về chúng tôi', value: 'about' },
        { label: '📞 Trang Liên hệ (có form)', value: 'contact' },
        { label: '❓ Trang FAQ / Hỏi đáp', value: 'faq' },
        { label: '🚀 Trang Landing Page', value: 'landing' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Chọn loại trang để áp dụng template phù hợp.',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Bố cục trang',
      defaultValue: 'withSidebar',
      options: [
        { label: '📰 Có Sidebar (như trang bài viết)', value: 'withSidebar' },
        { label: '📃 Nội dung hẹp căn giữa (dạng tài liệu)', value: 'narrow' },
        { label: '🖥️ Toàn chiều rộng (không sidebar)', value: 'fullWidth' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Chia sẻ mạng xã hội',
      admin: {
        description: 'Tùy chỉnh thông tin hiển thị khi chia sẻ lên Google, Facebook, Zalo...',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề SEO (để trống = dùng tiêu đề trang)',
          admin: { description: 'Tối đa 60 ký tự. VD: Giới thiệu Trang Trại Rau Sạch VietGAP' },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          admin: { rows: 3, description: 'Tối đa 160 ký tự. Mô tả ngắn hiển thị trên kết quả tìm kiếm Google.' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Ảnh chia sẻ (Open Graph Image)',
          admin: { description: 'Kích thước khuyến nghị: 1200×630px. Hiển thị khi chia sẻ lên Facebook, Zalo.' },
        },
      ],
    },
    {
      name: 'content',
      type: 'blocks',
      label: 'Nội dung trang (Page Builder)',
      labels: {
        singular: 'Thành phần',
        plural: 'Danh sách thành phần',
      },
      admin: {
        description: 'Kéo thả để sắp xếp thứ tự hiển thị các thành phần của trang.',
      },
      blocks: [
        RichTextBlock,
        SectionTitleBlock,
        CalloutBlock,
        ColumnsBlock,
        DividerBlock,
        CardGridBlock,
        CardBlock,
        StepsBlock,
        ButtonBlock,
        CtaBannerBlock,
        VideoBlock,
        TikTokBlock,
        GalleryBlock,
        PDFBlock,
        EmbedBlock,
        RelatedArticlesBlock,
        CategoryNewsBlock,
        FileDownloadsBlock,
        SliderBlock,
        HeroBannerBlock,
      ],
    },
  ],
};
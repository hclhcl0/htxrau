import type { CollectionConfig } from 'payload';
import { HeroBannerBlock } from '../blocks/HeroBanner.ts';
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { RichTextBlock } from '../blocks/RichTextBlock.ts';
import { SectionTitleBlock } from '../blocks/SectionTitleBlock.ts';
import { CardGridBlock } from '../blocks/CardGridBlock.ts';
import { StepsBlock } from '../blocks/StepsBlock.ts';
import { DividerBlock } from '../blocks/DividerBlock.ts';
import { CtaBannerBlock } from '../blocks/CtaBannerBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { FileDownloadsBlock } from '../blocks/FileDownloadsBlock.ts';
import { SliderBlock } from '../blocks/SliderBlock.ts';

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
    create: () => true,
    update: () => true,
    delete: () => true,
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
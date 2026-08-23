import type { CollectionConfig } from 'payload';
import {
  lexicalEditor,
  FixedToolbarFeature,
  HeadingFeature,
  AlignFeature,
  HTMLConverterFeature,
  BlocksFeature,
} from '@payloadcms/richtext-lexical';
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
import { CardBlock } from '../blocks/CardBlock.ts';
import { FileDownloadsBlock } from '../blocks/FileDownloadsBlock.ts';
import { SliderBlock } from '../blocks/SliderBlock.ts';

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Sản phẩm Rau',
    plural: 'Danh mục Rau An Toàn',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'standard', 'price', 'unit', 'status', 'isFeatured'],
    group: 'Quản lý Nông Sản',
    description: '👉 Quản lý danh mục các loại rau củ an toàn. Hiển thị trên web tại: /san-pham',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên loại rau / Nông sản',
      admin: {
        placeholder: 'VD: Cải ngọt Túy Loan, Xà lách mỡ, Cà chua bi Cherry...',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Đường dẫn tĩnh (Slug)',
      admin: {
        components: {
          Field: '@/components/SlugField.tsx#SlugField',
        },
        description: 'Tự động tạo từ tên rau (VD: cai-ngot-tuy-loan)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Phân loại rau',
      defaultValue: 'rau-an-la',
      options: [
        { label: 'Rau ăn lá (Mồng tơi, Cải, Rau muống, Xà lách...)', value: 'rau-an-la' },
        { label: 'Rau ăn củ, quả (Bí đao, Khổ qua, Cà chua, Dưa leo...)', value: 'rau-an-cu-qua' },
        { label: 'Rau mầm & Thủy canh', value: 'rau-mam-thuy-canh' },
        { label: 'Rau gia vị & Rau thơm (Hành, Ngò, Húng, Tía tô...)', value: 'rau-gia-vi' },
        { label: 'Nấm tươi sạch các loại', value: 'nam-tuoi' },
        { label: 'Trái cây an toàn theo mùa', value: 'trai-cay-theo-mua' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'standard',
      type: 'select',
      required: true,
      label: 'Tiêu chuẩn canh tác',
      defaultValue: 'vietgap',
      options: [
        { label: 'Chuẩn VietGAP', value: 'vietgap' },
        { label: 'Chuẩn GlobalGAP', value: 'globalgap' },
        { label: 'Đạt chuẩn OCOP Đà Nẵng', value: 'ocop' },
        { label: 'Thủy canh công nghệ cao', value: 'hydroponics' },
        { label: 'An toàn kiểm định ATVSTP', value: 'safe_certified' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Giá bán (VNĐ)',
          required: true,
          admin: {
            placeholder: 'VD: 35000',
            description: 'Giá bán hiện tại',
          },
        },
        {
          name: 'originalPrice',
          type: 'number',
          label: 'Giá gốc (VNĐ - Tùy chọn)',
          admin: {
            placeholder: 'VD: 45000',
            description: 'Hiện giá gạch ngang nếu đang giảm giá',
          },
        },
        {
          name: 'unit',
          type: 'text',
          label: 'Đơn vị tính',
          required: true,
          defaultValue: 'Túi 500g',
          admin: {
            placeholder: 'VD: Kg, Túi 500g, Bó 300g, Hộp...',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Tình trạng sản phẩm',
      defaultValue: 'in_stock',
      options: [
        { label: '✅ Có sẵn - Thu hoạch hôm nay', value: 'in_stock' },
        { label: '⏳ Đặt trước (Thu hoạch theo đợt)', value: 'pre_order' },
        { label: '❌ Tạm hết hàng / Hết mùa', value: 'out_of_stock' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: '⭐ Nổi bật trên Trang chủ',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tích chọn để hiển thị ưu tiên tại mục Sản phẩm nổi bật trên Trang chủ.',
      },
    },
    {
      name: 'origin',
      type: 'text',
      label: 'Nguồn gốc / Nông trại',
      defaultValue: 'HTX rau Túy Loan',
      admin: {
        placeholder: 'VD: HTX rau Túy Loan...',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Ảnh đại diện sản phẩm',
      admin: {
        description: 'Ảnh chụp tươi rõ nét của loại rau củ.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Album ảnh thực tế tại vườn',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Hình ảnh',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Ghi chú ảnh',
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Nội dung chi tiết bài viết sản phẩm',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'] }),
          AlignFeature(),
          HTMLConverterFeature({}),
          BlocksFeature({
            blocks: [
              VideoBlock,
              TikTokBlock,
              PDFBlock,
              GalleryBlock,
              CalloutBlock,
              ButtonBlock,
              ImageLinkBlock,
              RelatedArticlesBlock,
              ColumnsBlock,
              EmbedBlock,
              CardBlock,
              FileDownloadsBlock,
              SliderBlock,
            ],
          }),
        ],
      }),
    },
    {
      name: 'seasonAvailability',
      type: 'select',
      hasMany: true,
      label: '📅 Mùa vụ cung cấp',
      options: [
        { label: '🌿 Quanh năm', value: 'year_round' },
        { label: '❄️ Mùa Đông (Oct - Feb)', value: 'winter' },
        { label: '🌸 Mùa Xuân (Feb - May)', value: 'spring' },
        { label: '☀️ Mùa Hè (May - Aug)', value: 'summer' },
        { label: '🍂 Mùa Thu (Aug - Oct)', value: 'autumn' },
      ],
      defaultValue: ['year_round'],
      admin: {
        description: 'Các mùa mà sản phẩm này có thể cung cấp.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'harvestCycleDays',
          type: 'number',
          label: '⏱ Chu kỳ thu hoạch (ngày)',
          admin: {
            width: '50%',
            placeholder: 'VD: 30',
            description: 'Số ngày từ khi gieo đến khi thu hoạch.',
          },
        },
        {
          name: 'plantingArea',
          type: 'text',
          label: '🌾 Diện tích canh tác',
          admin: {
            width: '50%',
            placeholder: 'VD: 500m² nhà lưới, 1ha ngoài trời...',
          },
        },
      ],
    },
    {
      name: 'orderNum',
      type: 'number',
      label: 'Thứ tự ưu tiên hiển thị',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};

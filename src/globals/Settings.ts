import type { GlobalConfig } from 'payload';
import { ScheduleBlock } from '../blocks/ScheduleBlock.ts';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { MagazineBlock } from '../blocks/MagazineBlock.ts';


export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Cấu hình Website',
  admin: {
    group: 'Cấu hình',
    hidden: true,
  },
  access: {
    read: () => true,
    // Chỉ Admin mới được sửa cấu hình website
    update: ({ req: { user } }: any) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin'),
  },
  fields: [
    {
      name: 'homeNewsLimit',
      type: 'number',
      label: 'Số hàng hiển thị (Tin mới nhất)',
      defaultValue: 2,
      min: 1,
      max: 20,
      required: true,
      admin: {
        description: 'Số lượng bài viết sẽ tự động được tính bằng (Số hàng x Số cột). Áp dụng cho khối THÔNG TIN MỚI NHẤT.',
      }
    },
    {
      name: 'homeNewsColumnsDesktop',
      type: 'number',
      label: 'Số bài viết trên 1 hàng (Máy tính)',
      defaultValue: 5,
      min: 1,
      max: 6,
      required: true,
      admin: {
        description: 'Tuỳ chỉnh số lượng thẻ bài viết hiển thị trên cùng một hàng đối với giao diện màn hình lớn.',
      }
    },
    {
      name: 'homeNewsColumnsMobile',
      type: 'number',
      label: 'Số bài viết trên 1 hàng (Điện thoại)',
      defaultValue: 2,
      min: 1,
      max: 4,
      required: true,
      admin: {
        description: 'Tuỳ chỉnh số lượng thẻ bài viết hiển thị trên cùng một hàng đối với giao diện điện thoại.',
      }
    },
    {
      name: 'homeNewsLayout',
      type: 'select',
      label: 'Bố cục hiển thị (Tin mới nhất)',
      defaultValue: 'grid',
      options: [
        { label: 'Lưới tin tức (Grid)', value: 'grid' },
        { label: 'Slider trượt tự động (Carousel)', value: 'slider' },
        { label: 'Danh sách chi tiết (List)', value: 'list' },
        { label: 'Danh sách rút gọn / Tin vắn (Compact)', value: 'compact' },
        { label: 'Tin tiêu điểm + Danh sách phụ (Featured)', value: 'featured' },
        { label: 'Ảnh lớn trên + Danh sách tin nhỏ bên dưới', value: 'featured-stacked' },
      ],
      admin: {
        description: 'Lựa chọn hiển thị danh sách bài viết mới dưới dạng lưới tĩnh hoặc slider trượt tự động.',
      }
    },
    {
      name: 'heroSliderSize',
      type: 'select',
      label: 'Kích thước Slider Banner trang chủ',
      options: [
        { label: 'Nhỏ', value: 'small' },
        { label: 'Vừa', value: 'medium' },
        { label: 'Lớn', value: 'large' },
        { label: 'Tùy chỉnh', value: 'custom' },
      ],
      defaultValue: 'medium',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'heroSliderCustomHeight',
      type: 'number',
      label: 'Chiều cao tự gõ (px)',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'heroSliderEffect',
      type: 'select',
      label: 'Hiệu ứng chuyển ảnh Banner',
      options: [
        { label: '🔄 Trượt ngang (Slide)', value: 'slide' },
        { label: '✨ Mờ dần (Fade)', value: 'fade' },
        { label: '🔳 Thu phóng (Zoom)', value: 'zoom' },
        { label: '📦 Lật (Flip)', value: 'flip' },
      ],
      defaultValue: 'slide',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'homeContent',
      type: 'richText',
      label: 'Nội dung giới thiệu trang chủ (Kéo thả tự do)',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [
              ColumnsBlock,
              VideoBlock,
              TikTokBlock,
              PDFBlock,
              GalleryBlock,
              CalloutBlock,
              ButtonBlock,
              RelatedArticlesBlock,
              CardBlock,
              MagazineBlock
            ],
          }),
        ],
      }),
      admin: {
        description: 'Phần này sẽ hiển thị ở trang chủ, ngay bên dưới Slider Banner và bên trên Danh sách tin tức.',
      }
    },
    {
      name: 'themeConfig',
      type: 'group',
      label: 'Tùy chỉnh giao diện (Theme)',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Màu chủ đạo (Primary Color)',
          defaultValue: '#3a7fc7',
          admin: {
            components: {
              Field: '@/components/ColorPickerField.tsx#ColorPickerField',
            },
            description: 'Màu chính của trang web (VD: #3a7fc7).',
          }
        },
        {
          name: 'primaryDarkColor',
          type: 'text',
          label: 'Màu chủ đạo đậm (Hover)',
          defaultValue: '#0055a7',
          admin: {
            components: {
              Field: '@/components/ColorPickerField.tsx#ColorPickerField',
            },
            description: 'Màu khi rê chuột (hover) vào các nút bấm hoặc liên kết (VD: #0055a7).',
          }
        },
        {
          name: 'secondaryColor',
          type: 'text',
          label: 'Màu phụ / Nhấn (Secondary Color)',
          defaultValue: '#4999d6',
          admin: {
            components: {
              Field: '@/components/ColorPickerField.tsx#ColorPickerField',
            },
            description: 'Màu tạo điểm nhấn cho các họa tiết phụ (VD: #4999d6).',
          }
        },
        {
          name: 'fontFamily',
          type: 'select',
          label: 'Font chữ toàn trang (Google Fonts)',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter (Mặc định)', value: 'Inter' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Be Vietnam Pro (Tiếng Việt)', value: 'Be+Vietnam+Pro' },
            { label: 'Noto Sans (Tiếng Việt)', value: 'Noto+Sans' },
            { label: 'Source Sans 3', value: 'Source+Sans+3' },
            { label: 'Nunito', value: 'Nunito' },
            { label: 'Outfit', value: 'Outfit' },
            { label: 'Plus Jakarta Sans', value: 'Plus+Jakarta+Sans' },
            { label: 'Montserrat (Tiếng Việt)', value: 'Montserrat' },
            { label: 'Open Sans (Tiếng Việt)', value: 'Open+Sans' },
            { label: 'Mulish (Tiếng Việt)', value: 'Mulish' },
            { label: 'Lexend (Tiếng Việt)', value: 'Lexend' },
            { label: 'Noto Serif (Tiếng Việt - Serif)', value: 'Noto+Serif' },
            { label: 'Lora (Tiếng Việt - Serif)', value: 'Lora' },
            { label: 'Barlow (Tiếng Việt)', value: 'Barlow' },
            { label: 'Cabin (Tiếng Việt)', value: 'Cabin' },
            { label: 'Comfortaa (Tiếng Việt)', value: 'Comfortaa' },
          ],
          admin: {
            description: 'Chọn font chữ chính hiển thị trên toàn bộ website. Font sẽ được tải từ Google Fonts và áp dụng tức thì sau khi lưu.',
          }
        }
      ]
    },
    {
      name: 'homeSections',
      type: 'blocks',
      label: 'Các thành phần trên Trang chủ',
      labels: {
        singular: 'Thành phần',
        plural: 'Danh sách thành phần',
      },
      admin: {
        description: 'Kéo thả để sắp xếp thứ tự hiển thị. Mỗi thành phần là một khu vực riêng biệt trên trang chủ.',
      },
      blocks: [
        ScheduleBlock,

        // ── Block Gói Vắc Xin ──
        {
          slug: 'vaccineSection',
          interfaceName: 'VaccineSection',
          labels: { singular: '🧬 Khu vực Gói Vắc Xin', plural: 'Khu vực Gói Vắc Xin' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Tiêu đề khu vực',
                  defaultValue: 'Gói Vắc Xin Bảo Vệ Toàn Diện',
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  label: 'Mô tả phụ (tùy chọn)',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'limit',
                  type: 'number',
                  label: 'Số gói hiển thị tối đa',
                  defaultValue: 20,
                  min: 1,
                  max: 50,
                },
                {
                  name: 'showViewAll',
                  type: 'checkbox',
                  label: 'Hiển thị nút "Xem chi tiết"',
                  defaultValue: true,
                },
              ],
            },
          ],
        },

        // ── Block 1: Khu vực tin tức theo chuyên mục ──
        {
          slug: 'newsCategorySection',
          interfaceName: 'NewsCategorySection',
          labels: { singular: '📰 Khu vực Tin tức Chuyên mục', plural: 'Khu vực Tin tức Chuyên mục' },
          fields: [
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
              label: 'Chọn chuyên mục',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'limit',
                  type: 'number',
                  label: 'Số hàng hiển thị',
                  defaultValue: 2,
                  min: 1,
                  max: 20,
                  required: true,
                  admin: {
                    description: 'Số bài viết = Số hàng × Số cột (cấu hình ở trên).',
                  },
                },
                {
                  name: 'layout',
                  type: 'select',
                  label: 'Bố cục hiển thị',
                  defaultValue: 'grid',
                  options: [
                    { label: 'Lưới tin tức (Grid)', value: 'grid' },
                    { label: 'Slider trượt tự động (Carousel)', value: 'slider' },
                    { label: 'Danh sách chi tiết (List)', value: 'list' },
                    { label: 'Danh sách rút gọn / Tin vắn (Compact)', value: 'compact' },
                    { label: 'Tin tiêu điểm + Danh sách phụ (Featured)', value: 'featured' },
                    { label: 'Ảnh lớn trên + Danh sách tin nhỏ bên dưới', value: 'featured-stacked' },
                  ],
                },
              ]
            },
          ],
        },

        // ── Block 1.5: Khu vực Tin mới nhất (Kéo thả tự do) ──
        {
          slug: 'latestNewsSection',
          interfaceName: 'LatestNewsSection',
          labels: { singular: '📰 Khu vực Tin mới nhất', plural: 'Khu vực Tin mới nhất' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'limit',
                  type: 'number',
                  label: 'Số lượng bài hiển thị',
                  defaultValue: 8,
                  min: 2,
                  max: 40,
                  required: true,
                },
                {
                  name: 'layout',
                  type: 'select',
                  label: 'Bố cục hiển thị',
                  defaultValue: 'grid',
                  options: [
                    { label: 'Lưới tin tức (Grid)', value: 'grid' },
                    { label: 'Slider trượt tự động (Carousel)', value: 'slider' },
                    { label: 'Danh sách chi tiết (List)', value: 'list' },
                    { label: 'Danh sách rút gọn / Tin vắn (Compact)', value: 'compact' },
                    { label: 'Tin tiêu điểm + Danh sách phụ (Featured)', value: 'featured' },
                    { label: 'Ảnh lớn trên + Danh sách tin nhỏ bên dưới', value: 'featured-stacked' },
                  ],
                },
              ]
            },
            // ── Sidebar quảng cáo dịch vụ ──
            {
              name: 'adSlider',
              type: 'group',
              label: '📢 Sidebar Quảng cáo dịch vụ (ảnh 9:16)',
              admin: {
                description: 'Hiển thị bên phải trên desktop, bên dưới trên mobile.',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Bật sidebar quảng cáo',
                  defaultValue: false,
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Tiêu đề sidebar (tùy chọn)',
                  admin: { condition: (_, siblingData) => siblingData?.enabled },
                },
                {
                  name: 'autoplayInterval',
                  type: 'number',
                  label: 'Tự động chuyển ảnh (giây)',
                  defaultValue: 5,
                  min: 2,
                  max: 30,
                  admin: {
                    description: 'Đặt 0 để tắt tự động chuyển.',
                    condition: (_, siblingData) => siblingData?.enabled,
                  },
                },
                {
                  name: 'slides',
                  type: 'array',
                  label: 'Danh sách ảnh quảng cáo',
                  minRows: 0,
                  admin: { condition: (_, siblingData) => siblingData?.enabled },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                      label: 'Ảnh (nên dùng tỉ lệ 9:16 dọc)',
                    },
                    {
                      name: 'linkUrl',
                      type: 'text',
                      label: 'Link khi click (tùy chọn)',
                      admin: { description: 'VD: /dich-vu/kham-suc-khoe hoặc https://...' },
                    },
                    {
                      name: 'openInNewTab',
                      type: 'checkbox',
                      label: 'Mở link trong tab mới',
                      defaultValue: false,
                    },
                    {
                      name: 'altText',
                      type: 'text',
                      label: 'Mô tả ảnh (alt text)',
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ── Block 2: Banner hình ảnh ──
        {
          slug: 'bannerSection',
          interfaceName: 'BannerSection',
          labels: { singular: '🖼️ Banner Hình ảnh', plural: 'Banner Hình ảnh' },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Hình ảnh banner',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Tiêu đề (tùy chọn)',
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  label: 'Mô tả ngắn (tùy chọn)',
                },
              ]
            },
            {
              name: 'linkUrl',
              type: 'text',
              label: 'Đường dẫn khi nhấn vào banner',
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Mở liên kết trong tab mới',
              defaultValue: false,
            },
            {
              name: 'style',
              type: 'select',
              label: 'Kiểu hiển thị',
              defaultValue: 'fullwidth',
              options: [
                { label: 'Toàn chiều rộng (Full-width)', value: 'fullwidth' },
                { label: 'Thẻ có bo góc (Card)', value: 'card' },
              ],
            },
          ],
        },

        // ── Block 2.5: Danh sách Banner (Nhiều banner trên 1 hàng) ──
        {
          slug: 'multiBannerSection',
          interfaceName: 'MultiBannerSection',
          labels: { singular: '🖼️ Danh sách Banner', plural: 'Danh sách Banner' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực (tùy chọn)',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'columns',
                  type: 'number',
                  label: 'Số banner trên 1 hàng (Máy tính)',
                  defaultValue: 4,
                  min: 2,
                  max: 6,
                },
                {
                  name: 'bannerHeight',
                  type: 'number',
                  label: 'Chiều cao banner (px) - Tùy chọn',
                  admin: {
                    description: 'Bỏ trống nếu muốn ảnh tự động vừa theo tỷ lệ gốc.',
                  },
                },
              ]
            },
            {
              name: 'banners',
              type: 'array',
              label: 'Danh sách Banner',
              minRows: 1,
              maxRows: 12,
              labels: { singular: 'Banner', plural: 'Các banner' },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Hình ảnh',
                },
                {
                  name: 'linkUrl',
                  type: 'text',
                  label: 'Đường dẫn liên kết',
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  label: 'Mở trong tab mới',
                  defaultValue: true,
                },
              ],
            },
          ],
        },

        // ── Block 3: Khu vực Video YouTube ──
        {
          slug: 'videoSection',
          interfaceName: 'VideoSection',
          labels: { singular: '🎬 Khu vực Video Đa Kênh', plural: 'Khu vực Video Đa Kênh' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực',
              defaultValue: 'VIDEO NỔI BẬT',
            },
            {
              name: 'sourceType',
              type: 'radio',
              label: 'Nguồn Video',
              options: [
                { label: 'Lấy tự động từ Kênh', value: 'auto' },
                { label: 'Chọn thủ công từng Video', value: 'manual' }
              ],
              defaultValue: 'auto',
            },
            {
              name: 'channels',
              type: 'array',
              label: 'Chọn các Kênh hiển thị',
              admin: {
                condition: (data, siblingData) => siblingData.sourceType !== 'manual',
              },
              minRows: 1,
              labels: { singular: 'Kênh', plural: 'Các kênh' },
              fields: [
                {
                  name: 'channel',
                  type: 'relationship',
                  relationTo: 'video-channels',
                  label: 'Kênh',
                  required: true,
                  maxDepth: 0,
                }
              ]
            },
            {
              name: 'manualVideos',
              type: 'relationship',
              relationTo: 'videos',
              hasMany: true,
              label: 'Chọn Video thủ công',
              admin: {
                condition: (data, siblingData) => siblingData.sourceType === 'manual',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'limit',
                  type: 'number',
                  label: 'Số video hiển thị',
                  defaultValue: 4,
                  min: 1,
                  max: 12,
                },
                {
                  name: 'layout',
                  type: 'select',
                  label: 'Bố cục video',
                  defaultValue: 'grid',
                  options: [
                    { label: 'Lưới (Grid)', value: 'grid' },
                    { label: 'Video chính + Danh sách phụ', value: 'featured' },
                  ],
                },
              ]
            },
          ],
        },

        // ── Block 4: Khu vực TikTok ──
        {
          slug: 'tiktokSection',
          interfaceName: 'TiktokSection',
          labels: { singular: '📱 Khu vực TikTok', plural: 'Khu vực TikTok' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực',
              defaultValue: 'KÊNH TIKTOK CDC ĐÀ NẴNG',
            },
            {
              name: 'channel',
              type: 'relationship',
              relationTo: 'video-channels',
              label: 'Chọn kênh TikTok hiển thị',
              required: true,
              maxDepth: 0,
            },
            {
              name: 'limit',
              type: 'number',
              label: 'Số video TikTok hiển thị',
              defaultValue: 4,
              min: 1,
              max: 8,
            },
          ],
        },

        // ── Block 5: Thống kê / Số liệu nổi bật ──
        {
          slug: 'statsSection',
          interfaceName: 'StatsSection',
          labels: { singular: '📊 Thống kê / Số liệu', plural: 'Thống kê / Số liệu' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực (tùy chọn)',
            },
            {
              name: 'backgroundColor',
              type: 'select',
              label: 'Màu nền',
              defaultValue: 'primary',
              options: [
                { label: 'Màu chủ đạo (Primary)', value: 'primary' },
                { label: 'Màu trắng / Sáng', value: 'light' },
                { label: 'Màu xám nhạt', value: 'gray' },
              ],
            },
            {
              name: 'stats',
              type: 'array',
              label: 'Danh sách chỉ số thống kê',
              minRows: 1,
              maxRows: 6,
              labels: { singular: 'Chỉ số', plural: 'Các chỉ số' },
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Icon (emoji hoặc tên icon)',
                  defaultValue: '🏥',
                  admin: { description: 'Dán emoji vào đây, VD: 🏥 🧪 💉 👥 🌐' },
                },
                {
                  name: 'value',
                  type: 'text',
                  label: 'Con số / Giá trị',
                  required: true,
                  admin: { description: 'VD: 1,200 hoặc 99% hoặc 50+' },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Nhãn / Tên chỉ số',
                  required: true,
                  admin: { description: 'VD: Ca bệnh được điều trị' },
                },
                {
                  name: 'suffix',
                  type: 'text',
                  label: 'Hậu tố (tùy chọn)',
                  admin: { description: 'VD: ca, %, trạm, người' },
                },
              ],
            },
          ],
        },

        // ── Block 6: Liên kết nhanh / Dịch vụ trực tuyến ──
        {
          slug: 'quickLinksSection',
          interfaceName: 'QuickLinksSection',
          labels: { singular: '⚡ Liên kết nhanh / Dịch vụ', plural: 'Liên kết nhanh / Dịch vụ' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực',
              defaultValue: 'DỊCH VỤ TRỰC TUYẾN',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Danh sách liên kết',
              minRows: 1,
              maxRows: 12,
              labels: { singular: 'Liên kết', plural: 'Các liên kết' },
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Icon (emoji)',
                  defaultValue: '🔗',
                  admin: { description: 'Dán emoji, VD: 📋 🏥 💊 🧾 📞 🌐' },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Tên liên kết / Dịch vụ',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Đường dẫn URL',
                  required: true,
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  label: 'Mở trong tab mới',
                  defaultValue: true,
                },
                {
                  name: 'color',
                  type: 'select',
                  label: 'Màu thẻ',
                  defaultValue: 'primary',
                  options: [
                    { label: 'Màu chủ đạo', value: 'primary' },
                    { label: 'Màu phụ / Xanh dương', value: 'secondary' },
                    { label: 'Xanh lá', value: 'green' },
                    { label: 'Cam', value: 'orange' },
                    { label: 'Đỏ', value: 'red' },
                    { label: 'Tím', value: 'purple' },
                    { label: 'Xám', value: 'gray' },
                  ],
                },
              ],
            },
          ],
        },

        // ── Block 7: Nội dung tự do (RichText) đã bị loại bỏ để tránh lỗi vòng lặp ──
      ],
    },
    {
      name: 'aiChatSettings',
      type: 'group',
      label: '🤖 Cài đặt AI Chat (Hỏi đáp tự động)',
      admin: {
        description: 'Cấu hình widget hỏi đáp AI hiển thị cho người dân trên website.',
      },
      fields: [
        {
          name: 'chatEnabled',
          type: 'checkbox',
          label: 'Bật widget AI Chat trên website',
          defaultValue: true,
          admin: {
            description: 'Tích vào để hiển thị nút chat AI ở góc dưới phải trang web.',
          },
        },
        {
          name: 'chatWelcomeMessage',
          type: 'text',
          label: 'Tin nhắn chào mừng',
          defaultValue: 'Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?',
          admin: {
            description: 'Tin nhắn đầu tiên AI hiển thị khi người dùng mở hộp chat.',
          },
        },
        {
          name: 'chatCustomPrompt',
          type: 'textarea',
          label: 'Hướng dẫn bổ sung cho AI (tùy chọn)',
          admin: {
            description: 'Các quy tắc đặc biệt muốn AI tuân theo. Để trống nếu không cần.',
            rows: 4,
            placeholder: 'Ví dụ: Luôn nhắc hotline ở cuối mỗi câu trả lời...',
          },
        },
        {
          name: 'aiHotline',
          type: 'text',
          label: 'Số Hotline liên hệ',
          defaultValue: '1900988975',
          admin: {
            description: 'Số điện thoại AI sẽ cung cấp cho người dân khi không tìm thấy thông tin.',
          },
        },
        {
          name: 'aiAddress',
          type: 'text',
          label: 'Địa chỉ cơ quan',
          defaultValue: '118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng',
          admin: {
            description: 'Địa chỉ AI sẽ cung cấp cho người dân khi không tìm thấy thông tin.',
          },
        },
        {
          name: 'aiModel',
          type: 'select',
          label: 'Mô hình AI sử dụng (Dành cho Chatbot)',
          defaultValue: 'gemini-2.5-flash',
          options: [
            { label: 'Gemini 2.5 Flash (Tốc độ cao, Khuyên dùng)', value: 'gemini-2.5-flash' },
            { label: 'Gemini 2.5 Pro (Thông minh, Phức tạp)', value: 'gemini-2.5-pro' },
            { label: 'Gemini 3.1 Flash (Thử nghiệm)', value: 'gemini-3.1-flash' },
            { label: 'Llama 3.3 70B (Groq - Miễn phí)', value: 'llama-3.3-70b-versatile' }
          ],
          admin: {
            description: 'Chọn mô hình AI mặc định để phục vụ người dân tra cứu.',
          }
        },
      ],
    },
    {
      name: 'sidebarWidgets',
      type: 'blocks',
      label: 'Các Tiện Ích Thanh Bên (Sidebar Widgets)',
      labels: {
        singular: 'Tiện ích',
        plural: 'Danh sách tiện ích',
      },
      blocks: [
        {
          slug: 'categoriesWidget',
          interfaceName: 'CategoriesWidget',
          labels: { singular: 'Widget Chuyên mục', plural: 'Widget Chuyên mục' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Chuyên mục', required: true },
            { name: 'limit', type: 'number', label: 'Giới hạn số chuyên mục hiển thị', defaultValue: 10 },
          ]
        },
        {
          slug: 'recentArticlesWidget',
          interfaceName: 'RecentArticlesWidget',
          labels: { singular: 'Widget Bài viết mới', plural: 'Widget Bài viết mới' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Tin mới cập nhật', required: true },
            { name: 'limit', type: 'number', label: 'Số lượng bài viết hiển thị', defaultValue: 5, min: 1, max: 15 },
          ]
        },
        {
          slug: 'tiktokWidget',
          interfaceName: 'TiktokWidget',
          labels: { singular: 'Widget TikTok Player', plural: 'Widget TikTok Player' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Kênh TikTok CDC' },
            { name: 'channel', type: 'relationship', relationTo: 'video-channels', label: 'Chọn Kênh TikTok hiển thị', required: true, maxDepth: 0 },
          ]
        },
        {
          slug: 'facebookWidget',
          interfaceName: 'FacebookWidget',
          labels: { singular: 'Widget Facebook Fanpage', plural: 'Widget Facebook Fanpage' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Fanpage CDC' },
            { name: 'pageUrl', type: 'text', label: 'Đường dẫn Trang Facebook (URL)', defaultValue: 'https://www.facebook.com/cdcdanang', required: true },
            { name: 'height', type: 'number', label: 'Chiều cao khung nhúng (px)', defaultValue: 350 },
          ]
        },
        {
          slug: 'bannerWidget',
          interfaceName: 'BannerWidget',
          labels: { singular: 'Widget Banner Quảng cáo', plural: 'Widget Banner Quảng cáo' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề (Không bắt buộc)', defaultValue: '' },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Tải ảnh Banner lên', required: true },
            { name: 'linkUrl', type: 'text', label: 'Đường dẫn liên kết khi nhấn vào banner', defaultValue: '' },
            { name: 'openInNewTab', type: 'checkbox', label: 'Mở liên kết trong tab mới', defaultValue: true },
          ]
        },
        {
          slug: 'customHtmlWidget',
          interfaceName: 'CustomHtmlWidget',
          labels: { singular: 'Widget HTML tùy chỉnh', plural: 'Widget HTML tùy chỉnh' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích' },
            { name: 'htmlContent', type: 'textarea', label: 'Mã nhúng HTML / Iframe / Scripts', required: true, admin: { rows: 6 } },
          ]
        }
      ]
    },
    {
      name: 'articleReaderTools',
      type: 'group',
      label: '📖 Tiện ích Đọc bài viết',
      admin: {
        description: 'Bật/tắt các nút tiện ích hiển thị trong trang đọc bài viết. Thay đổi có hiệu lực ngay sau khi lưu.',
      },
      fields: [
        {
          name: 'showFontSize',
          type: 'checkbox',
          label: 'Cỡ chữ (A / A+ / A++)',
          defaultValue: true,
          admin: { description: 'Hiển thị nhóm nút thay đổi cỡ chữ bài viết.' },
        },
        {
          name: 'showTTS',
          type: 'checkbox',
          label: 'Đọc bài viết (Text-to-Speech)',
          defaultValue: true,
          admin: { description: 'Hiển thị nút nghe đọc nội dung bài viết bằng giọng nói.' },
        },
        {
          name: 'showShareFB',
          type: 'checkbox',
          label: 'Chia sẻ Facebook',
          defaultValue: true,
          admin: { description: 'Hiển thị nút chia sẻ bài viết lên Facebook.' },
        },
        {
          name: 'showShareZalo',
          type: 'checkbox',
          label: 'Chia sẻ Zalo',
          defaultValue: true,
          admin: { description: 'Hiển thị nút chia sẻ bài viết qua Zalo.' },
        },
        {
          name: 'showGoogleNews',
          type: 'checkbox',
          label: 'Nút theo dõi Google News',
          defaultValue: false,
          admin: { description: 'Hiển thị nút kêu gọi người đọc theo dõi kênh trên Google News.' },
        },
        {
          name: 'googleNewsUrl',
          type: 'text',
          label: 'Đường dẫn (URL) Kênh Google News',
          admin: { 
            description: 'Ví dụ: https://news.google.com/publications/CAAqBwg...',
            condition: (data, siblingData) => siblingData?.showGoogleNews === true,
          },
        },
        {
          name: 'showCopyLink',
          type: 'checkbox',
          label: 'Chép link bài viết',
          defaultValue: true,
          admin: { description: 'Hiển thị nút sao chép đường dẫn bài viết vào clipboard.' },
        },
        {
          name: 'showPrint',
          type: 'checkbox',
          label: 'In trang',
          defaultValue: true,
          admin: { description: 'Hiển thị nút in nội dung bài viết.' },
        },
        {
          name: 'showReadProgress',
          type: 'checkbox',
          label: 'Thanh tiến trình đọc bài (Reading Progress Bar)',
          defaultValue: true,
          admin: { description: 'Hiển thị thanh màu chạy dọc theo đầu trang khi người đọc cuộn xuống.' },
        },
      ],
    },
  ],
};

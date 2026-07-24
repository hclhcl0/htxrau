import type { GlobalConfig } from 'payload';
import { Settings } from './Settings.ts';
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cài đặt trang web',
  admin: {
    group: 'Cài đặt giao diện',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }: any) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin'),
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────────────────────────

        {
          label: 'Bố cục Trang chủ',
          fields: [
            {
          type: 'group',
          label: 'Trang chủ',
          fields: [
            {
              type: 'row',
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
                    description: 'Số lượng bài viết = Số hàng × Số cột.',
                  },
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
                  ],
                },
              ]
            },
          ],
        },

        // ─────────────────────────────────────────────,
            {
          type: 'group',
          label: 'Banner',
          name: 'banner',
          fields: [
            {
              type: 'row',
              fields: [
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
                    description: 'Định dạng chiều cao áp dụng chung cho toàn bộ khối Slider Banner.',
                  },
                },
                {
                  name: 'heroSliderCustomHeight',
                  type: 'number',
                  label: 'Chiều cao tự gõ (px)',
                  admin: {
                    condition: (data) => data?.banner?.heroSliderSize === 'custom',
                    description: 'Nhập chiều cao bằng pixel (ví dụ: 500). Áp dụng chung cho toàn bộ Slider.',
                  },
                },
              ]
            },
            {
              type: 'row',
              fields: [
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
                    description: 'Chọn hiệu ứng hoạt hình khi chuyển từ ảnh này sang ảnh.',
                  },
                },
                {
                  name: 'heroSliderAutoplayDelay',
                  type: 'number',
                  label: 'Thời gian dừng ở mỗi ảnh (mili-giây)',
                  defaultValue: 5000,
                  admin: {
                    description: 'Nhập thời gian tính bằng mili-giây (1 giây = 1000).',
                  },
                },
              ]
            },
            {
              name: 'sidebarBanners',
              type: 'array',
              label: 'Danh sách Banner bên trái (Dưới Menu dọc)',
              admin: {
                description: 'Các banner quảng cáo hoặc thông báo sẽ hiển thị ở cột bên trái của các trang chuyên mục.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Ảnh Banner',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Đường dẫn liên kết (Link)',
                  admin: {
                    description: 'VD: https://google.com hoặc /bai-viet/abc',
                  },
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

        // ─────────────────────────────────────────────,
            {
          type: 'collapsible',
          label: 'Bố cục Trang chủ',
          fields: [
            ...(Settings.fields as any[]).filter(f => ['homeContent', 'homeSections'].includes(f.name))
          ]
        },
        // ─────────────────────────────────────────────
          ]
        },
        {
          label: 'Thành phần dùng chung',
          fields: [
            {
          type: 'group',
          label: 'Header',
          name: 'header',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              defaultValue: 'Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng',
              label: 'Tên Website',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'logoCustomization',
              type: 'group',
              label: 'Tùy chỉnh Logo',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'logoHeight',
                      type: 'number',
                      label: 'Chiều cao Logo (px)',
                      defaultValue: 80,
                      min: 20,
                      max: 200,
                      admin: {
                        description: 'Điều chỉnh chiều cao logo. Chiều rộng sẽ tự động co giãn theo tỷ lệ.',
                      },
                    },
                    {
                      name: 'logoPosition',
                      type: 'select',
                      label: 'Căn chỉnh Logo',
                      defaultValue: 'left',
                      options: [
                        { label: '⬅ Căn trái', value: 'left' },
                        { label: '⬛ Căn giữa', value: 'center' },
                        { label: '➡ Căn phải', value: 'right' },
                      ],
                    },
                  ]
                },
                {
                  name: 'showSiteName',
                  type: 'checkbox',
                  label: 'Hiển thị tên website bên cạnh Logo',
                  defaultValue: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'siteNameLine1',
                      type: 'text',
                      label: 'Dòng chữ thứ nhất bên cạnh Logo',
                      defaultValue: 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
                      admin: {
                        condition: (data) => data?.header?.logoCustomization?.showSiteName !== false,
                      },
                    },
                    {
                      name: 'siteNameLine2',
                      type: 'text',
                      label: 'Dòng chữ thứ hai bên cạnh Logo',
                      defaultValue: 'THÀNH PHỐ ĐÀ NẴNG',
                      admin: {
                        condition: (data) => data?.header?.logoCustomization?.showSiteName !== false,
                      },
                    },
                  ]
                },
                {
                  name: 'siteTagline',
                  type: 'text',
                  label: 'Slogan / Tagline (bên dưới tên website)',
                  defaultValue: 'Phòng bệnh chủ động-vươn rộng tương lai',
                  admin: {
                    description: 'Dòng phụ nhỏ hiển thị bên dưới tên website. Để trống nếu không cần.',
                    condition: (data) => data?.header?.logoCustomization?.showSiteName !== false,
                  },
                },
                {
                  name: 'logoBannerImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Hình ảnh bên dưới Logo (không bắt buộc)',
                  admin: {
                    description: 'Ảnh phụ nhỏ hiển thị bên dưới logo.',
                  },
                },
                {
                  name: 'mobileLogo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo riêng trên Điện thoại (Không bắt buộc)',
                },
                {
                  name: 'mobileLogoHeight',
                  type: 'number',
                  label: 'Chiều cao Logo trên Điện thoại (px)',
                  defaultValue: 40,
                  min: 15,
                  max: 100,
                },
                {
                  name: 'logoHoverEffect',
                  type: 'select',
                  label: 'Hiệu ứng rê chuột vào Logo (Hover)',
                  defaultValue: 'bounce',
                  options: [
                    { label: 'Không có hiệu ứng', value: 'none' },
                    { label: 'Phóng to & nghiêng (Scale & Tilt)', value: 'scale-tilt' },
                    { label: 'Phóng to & phát sáng (Scale & Glow)', value: 'glow' },
                    { label: 'Nhảy nhẹ lên (Bounce)', value: 'bounce' },
                  ],
                },
                {
                  name: 'mobileShowSiteName',
                  type: 'checkbox',
                  label: 'Hiển thị tên website cạnh Logo trên Điện thoại',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'searchCustomization',
              type: 'group',
              label: 'Tùy chỉnh Ô Tìm Kiếm',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'position',
                      type: 'select',
                      label: 'Vị trí đặt ô Tìm kiếm',
                      defaultValue: 'navbar',
                      options: [
                        { label: '⬇ Trong thanh Hotline (Mặc định)', value: 'hotline' },
                        { label: '➡ Trên thanh điều hướng chính (MainMenu)', value: 'navbar' },
                        { label: '➡ Bên phải thanh Menu điều hướng', value: 'menu' },
                        { label: '➡ Bên phải Đăng nhập/Đăng ký (TopBar)', value: 'topbar' },
                        { label: '❌ Ẩn nút tìm kiếm', value: 'hidden' },
                      ],
                    },
                    {
                      name: 'style',
                      type: 'select',
                      label: 'Cách hiển thị',
                      defaultValue: 'popup',
                      options: [
                        { label: '🔍 Ô nhập trực tiếp (Inline Input)', value: 'inline' },
                        { label: '📱 Nút icon kích hoạt Popup (Search Popup)', value: 'popup' },
                      ],
                    },
                  ]
                },
                {
                  name: 'width',
                  type: 'number',
                  label: 'Chiều rộng ô nhập trực tiếp (px)',
                  defaultValue: 250,
                  min: 150,
                  max: 600,
                },
              ],
            },
            {
              name: 'hotline',
              type: 'group',
              label: 'Đường dây nóng (Hotline Bar)',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'phone',
                      type: 'text',
                      label: 'Số điện thoại',
                      defaultValue: '0236 3890 407',
                    },
                    {
                      name: 'actionLink',
                      type: 'text',
                      label: 'Link Nút "Đặt câu hỏi"',
                      defaultValue: '#',
                    },
                  ]
                },
                {
                  name: 'position',
                  type: 'select',
                  label: 'Vị trí Hotline Bar',
                  defaultValue: 'topbar',
                  options: [
                    { label: '⬇ Dưới thanh điều hướng (Mặc định)', value: 'below-nav' },
                    { label: '⬆ Trên thanh điều hướng (Dưới TopBar)', value: 'above-nav' },
                    { label: '🔝 Trên cùng của trang (Trên cả TopBar)', value: 'very-top' },
                    { label: '➡ Bên phải Đăng nhập/Đăng ký (TopBar)', value: 'topbar' },
                  ],
                },
              ],
            },
            {
              name: 'socialLinks',
              type: 'group',
              label: 'Mạng xã hội (Top Bar)',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'facebook', type: 'text', label: 'Facebook URL' },
                    { name: 'youtube', type: 'text', label: 'Youtube URL' },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'twitter', type: 'text', label: 'Twitter URL' },
                    { name: 'instagram', type: 'text', label: 'Instagram URL' },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'zalo', type: 'text', label: 'Zalo OA URL' },
                    { name: 'miniapp', type: 'text', label: 'Zalo Mini App URL' },
                  ]
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────,
            {
          type: 'group',
          label: 'Chân trang',
          name: 'footer',
          fields: [
            {
              name: 'aboutText',
              type: 'textarea',
              label: 'Đoạn giới thiệu ngắn (Hiển thị ở Footer)',
              defaultValue: '',
            },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'addressMain',
                      type: 'text',
                      label: 'Trụ sở chính',
                      defaultValue: '',
                    },
                    {
                      name: 'addressSub',
                      type: 'text',
                      label: 'Cơ sở 2',
                      defaultValue: '',
                    },
                  ]
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'phone',
                      type: 'text',
                      label: 'Số điện thoại',
                      defaultValue: '',
                    },
                    {
                      name: 'email',
                      type: 'text',
                      label: 'Email',
                      defaultValue: '',
                    },
                  ]
                },
            {
              name: 'quickLinks',
              type: 'array',
              label: 'Liên kết nhanh',
              fields: [
                { name: 'label', type: 'text', required: true, label: 'Tên' },
                { name: 'url', type: 'text', required: true, label: 'URL' },
              ],
            },
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Mạng xã hội (Các kênh truyền thông)',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      label: 'Nền tảng',
                      required: true,
                      options: [
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'TikTok', value: 'tiktok' },
                        { label: 'Zalo', value: 'zalo' },
                        { label: 'Website khác', value: 'website' },
                      ],
                    },
                    {
                      name: 'label',
                      type: 'text',
                      label: 'Tên kênh',
                      required: true,
                    },
                  ]
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Đường dẫn (URL)',
                  required: true,
                },
              ],
            },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'copyrightText',
                      type: 'text',
                      label: 'Dòng bản quyền (Copyright)',
                      defaultValue: '© Bản quyền thuộc về TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG',
                      admin: {
                        description: 'Sử dụng {year} để tự động hiển thị năm hiện tại.',
                      },
                    },
                    {
                      name: 'designerCredit',
                      type: 'text',
                      label: 'Thông tin thiết kế',
                      defaultValue: 'thiết kế bởi CNTT CDC Đà Nẵng',
                    },
                  ]
                },
          ],
        },

        // ─────────────────────────────────────────────
          ]
        },
                {
          label: 'Menu',
          fields: [
    {
          type: 'group',
          label: 'Menu Điều Hướng',
          name: 'menu',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'menuPosition',
                  type: 'select',
                  label: 'Vị trí Menu điều hướng',
                  defaultValue: 'below',
                  options: [
                    { label: '➡ Bên phải Logo (cùng hàng)', value: 'right' },
                    { label: '⬇ Thanh riêng bên dưới Logo', value: 'below' },
                    { label: '⬅ Bên trái Logo (cùng hàng)', value: 'left' },
                  ],
                  admin: {
                    description: 'Chọn nơi hiển thị thanh menu điều hướng chính.',
                  },
                },
                {
                  name: 'navStyle',
                  type: 'select',
                  label: '🎨 Phong cách nền Menu',
                  defaultValue: 'white',
                  options: [
                    { label: '⬜ Trắng (Mặc định)', value: 'white' },
                    { label: '🟦 Màu chủ đạo (Solid Primary)', value: 'primary' },
                    { label: '🌊 Gradient tối (Gradient Dark)', value: 'gradient' },
                  ],
                  admin: {
                    description: 'Chọn màu nền cho thanh menu điều hướng. Áp dụng cho cả menu inline và menu bên dưới logo.',
                  },
                },
              ]
            },
            {
              name: 'menuItems',
              type: 'array',
              label: 'Danh sách Menu',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: 'Tên Menu',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'presetUrl',
                      type: 'select',
                      label: '📌 Chọn trang có sẵn (tùy chọn)',
                      options: [
                        { label: '🏠 Trang chủ', value: '/' },
                        { label: '📰 Tất cả Bài viết', value: '/bai-viet' },
                        { label: '🩺 Sức khỏe cộng đồng', value: '/suc-khoe' },
                        { label: '📄 Văn bản điều hành', value: '/documents' },
                        { label: '📋 Thủ tục hành chính', value: '/procedures' },
                        { label: '🛒 Mua sắm & Đấu thầu', value: '/mua-sam' },
                        { label: '🏥 Dịch vụ y tế', value: '/dich-vu' },
                        { label: '🎬 Video truyền thông', value: '/video' },
                        { label: '📅 Lịch công tác', value: '/lich-cong-tac' },
                        { label: '📞 Liên hệ', value: '/contact' },
                        { label: '🔍 Tìm kiếm', value: '/search' },
                      ],
                      admin: {
                        description: 'Chọn trang nội bộ. Nếu cần URL khác, điền bên dưới.',
                      },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      label: 'Đường dẫn tùy chỉnh',
                      admin: {
                        description: 'Ví dụ: /chuyen-muc/phong-chong-dich hoặc https://...',
                      },
                    },
                  ]
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  label: 'Mở trong tab mới',
                  defaultValue: false,
                },
                {
                  name: 'subItems',
                  type: 'array',
                  label: 'Menu Con (Dropdown)',
                  fields: [
                    { name: 'label', type: 'text', required: true, label: 'Tên mục con' },
                    {
                      name: 'presetUrl',
                      type: 'select',
                      label: '📌 Chọn trang có sẵn (tùy chọn)',
                      options: [
                        { label: '🏠 Trang chủ', value: '/' },
                        { label: '📰 Tất cả Bài viết', value: '/bai-viet' },
                        { label: '🩺 Sức khỏe cộng đồng', value: '/suc-khoe' },
                        { label: '📄 Văn bản điều hành', value: '/documents' },
                        { label: '📋 Thủ tục hành chính', value: '/procedures' },
                        { label: '🛒 Mua sắm & Đấu thầu', value: '/mua-sam' },
                        { label: '🏥 Dịch vụ y tế', value: '/dich-vu' },
                        { label: '🎬 Video truyền thông', value: '/video' },
                        { label: '📅 Lịch công tác', value: '/lich-cong-tac' },
                        { label: '📞 Liên hệ', value: '/contact' },
                        { label: '🔍 Tìm kiếm', value: '/search' },
                      ],
                      admin: {
                        description: 'Chọn một trang nội bộ có sẵn để tự điền đường dẫn.',
                      },
                    },
                    { name: 'url', type: 'text', label: 'Đường dẫn tùy chỉnh' },
                    { name: 'openInNewTab', type: 'checkbox', label: 'Mở trong tab mới', defaultValue: false },
                  ],
                },
              ],
            },
          ],
        },

        
          ]
        },
{
          label: 'Giao diện & Thanh bên',
          fields: [
            {
          type: 'group',
          label: 'Giao diện',
          name: 'theme',
          fields: [
            {
              name: 'orgLayout',
              type: 'select',
              label: 'Kiểu hiển thị trang Cơ cấu tổ chức',
              defaultValue: 'chart_accordion',
              admin: {
                description: 'Thay đổi sẽ có hiệu lực ngay trên trang web.',
              },
              options: [
                { label: '🏛️ Sơ đồ + Danh sách (mặc định)', value: 'chart_accordion' },
                { label: '📁 Thẻ danh sách (Card Grid)', value: 'card_grid' },
                { label: '📋 Bảng đơn giản (Simple Table)', value: 'simple_table' },
                { label: '🗂️ Tabs theo nhóm', value: 'tabs' },
                { label: '🌳 Chỉ Sơ đồ Org Chart', value: 'chart_only' },
              ],
            },
            {
              name: 'orgColors',
              type: 'group',
              label: 'Màu sắc Cơ cấu tổ chức',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ban_lanh_dao',
                      type: 'text',
                      label: 'Màu Ban Lãnh đạo',
                      defaultValue: '#0d47a1',
                      admin: { description: 'Nhập mã màu HEX (VD: #0d47a1)', width: '50%' },
                    },
                    {
                      name: 'phong',
                      type: 'text',
                      label: 'Màu Phòng chức năng',
                      defaultValue: '#2e7d32',
                      admin: { description: 'Nhập mã màu HEX (VD: #2e7d32)', width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'khoa',
                      type: 'text',
                      label: 'Màu Khoa chuyên môn',
                      defaultValue: '#1976d2',
                      admin: { description: 'Nhập mã màu HEX (VD: #1976d2)', width: '50%' },
                    },
                    {
                      name: 'khac',
                      type: 'text',
                      label: 'Màu Đơn vị khác',
                      defaultValue: '#e65100',
                      admin: { description: 'Nhập mã màu HEX (VD: #e65100)', width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────,
            {
          type: 'group',
          label: 'Sidebar',
          name: 'sidebar',
          fields: [
            {
              name: 'widthRatio',
              type: 'select',
              required: true,
              defaultValue: 'Sidebar 33% - Main 67%',
              options: [
                { label: 'Sidebar 25% - Main 75%', value: 'Sidebar 25% - Main 75%' },
                { label: 'Sidebar 33% - Main 67%', value: 'Sidebar 33% - Main 67%' },
                { label: 'Sidebar 50% - Main 50%', value: 'Sidebar 50% - Main 50%' },
              ],
              label: 'Tỷ lệ chiều rộng',
            },
            {
              name: 'gapSize',
              type: 'select',
              required: true,
              defaultValue: 'Vừa',
              options: [
                { label: 'Không khoảng cách', value: 'Không khoảng cách' },
                { label: 'Nhỏ', value: 'Nhỏ' },
                { label: 'Vừa', value: 'Vừa' },
                { label: 'Lớn', value: 'Lớn' },
              ],
              label: 'Khoảng cách (Gap)',
            },
            {
              name: 'blocks',
              type: 'blocks',
              blocks: [CategoryNewsBlock],
              label: 'Các khối nội dung Sidebar',
            },
          ],
        },

        // ─────────────────────────────────────────────,
            {
          type: 'group',
          label: 'Tiện ích Đọc bài',
          name: 'articleReaderTools',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'showFontSize',
                  type: 'checkbox',
                  label: 'Cỡ chữ (A / A+ / A++)',
                  defaultValue: true,
                },
                {
                  name: 'showTTS',
                  type: 'checkbox',
                  label: 'Đọc bài viết (Text-to-Speech)',
                  defaultValue: true,
                },
                {
                  name: 'showReadProgress',
                  type: 'checkbox',
                  label: 'Thanh tiến trình đọc bài',
                  defaultValue: true,
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showShareFB',
                  type: 'checkbox',
                  label: 'Chia sẻ Facebook',
                  defaultValue: true,
                },
                {
                  name: 'showShareZalo',
                  type: 'checkbox',
                  label: 'Chia sẻ Zalo',
                  defaultValue: true,
                },
                {
                  name: 'showCopyLink',
                  type: 'checkbox',
                  label: 'Chép link bài viết',
                  defaultValue: true,
                },
                {
                  name: 'showPrint',
                  type: 'checkbox',
                  label: 'In trang',
                  defaultValue: true,
                },
              ]
            },
          ],
        },
        // ─────────────────────────────────────────────,
            {
          type: 'collapsible',
          label: 'Cấu hình Nâng cao',
          fields: [
            ...(Settings.fields as any[]).filter(f => ['themeConfig', 'sidebarWidgets'].includes(f.name))
          ]
        }
          ]
        },
        {
          label: 'Tính năng mở rộng',
          fields: [
            {
          type: 'group',
          label: 'AI Chat',
          name: 'aiChatSettings',
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
            },
            {
              name: 'chatCustomPrompt',
              type: 'textarea',
              label: 'Hướng dẫn bổ sung cho AI (tùy chọn)',
              admin: {
                rows: 4,
                placeholder: 'Ví dụ: Luôn nhắc hotline ở cuối mỗi câu trả lời...',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'aiHotline',
                  type: 'text',
                  label: 'Số Hotline liên hệ',
                  defaultValue: '1900988975',
                },
                {
                  name: 'aiModel',
                  type: 'select',
                  label: 'Mô hình AI sử dụng',
                  defaultValue: 'gemini-2.5-flash',
                  options: [
                    { label: 'Gemini 2.5 Flash (Tốc độ cao, Khuyên dùng)', value: 'gemini-2.5-flash' },
                    { label: 'Gemini 2.5 Pro (Thông minh, Phức tạp)', value: 'gemini-2.5-pro' },
                    { label: 'Llama 3.3 70B (Groq - Miễn phí)', value: 'llama-3.3-70b-versatile' },
                  ],
                },
              ]
            },
            {
              name: 'aiAddress',
              type: 'text',
              label: 'Địa chỉ cơ quan',
              defaultValue: '118 Lê Đình Lý, Phường Thanh Khê Đông, Quận Thanh Khê, Thành phố Đà Nẵng',
            },
          ],
        },

        // ─────────────────────────────────────────────,
            {
          type: 'group',
          label: 'Thông báo (Popup)',
          name: 'popup',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Bật cửa sổ thông báo (Popup)',
              defaultValue: false,
              admin: {
                description: 'Khi bật, cửa sổ popup sẽ hiển thị ngay khi người dùng truy cập trang web.',
              },
            },
            {
              name: 'type',
              type: 'select',
              label: 'Kiểu hiển thị',
              defaultValue: 'manual',
              options: [
                { label: 'Tự soạn thảo (Manual)', value: 'manual' },
                { label: 'Lấy từ Bài viết (Article)', value: 'article' },
                { label: '📋 Danh sách dịch vụ / Thông báo (Services)', value: 'services' },
              ],
              admin: {
                condition: (data) => data?.popup?.enabled,
              },
            },
            // ── Fields for Services popup type ──────────────────────
            {
              name: 'servicesTitle',
              type: 'text',
              label: '[Dịch vụ] Tiêu đề banner',
              defaultValue: 'Dịch vụ & Thông báo CDC Đà Nẵng',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'services',
                description: 'Tiêu đề hiển thị trên banner màu xanh ở đầu popup.',
              },
            },
            {
              name: 'servicesSubtitle',
              type: 'text',
              label: '[Dịch vụ] Phụ đề banner',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'services',
              },
            },
            {
              name: 'servicesMascot',
              type: 'upload',
              relationTo: 'media',
              label: '[Dịch vụ] Ảnh mascot / nhân vật',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'services',
                description: 'Ảnh nhân vật nổi phía trên popup. Nên dùng ảnh nền trong suốt (PNG).',
              },
            },
            {
              name: 'servicesHeaderColor',
              type: 'text',
              label: '[Dịch vụ] Màu banner (hex)',
              defaultValue: '#00a99d',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'services',
                description: 'Màu nền của banner tiêu đề. Ví dụ: #00a99d, #1a4fa0',
              },
            },
            {
              name: 'servicesItems',
              type: 'array',
              label: '[Dịch vụ] Danh sách mục',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'services',
                description: 'Thêm các mục thông tin dịch vụ hoặc thông báo muốn hiển thị trong popup.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'text',
                      label: 'Emoji icon (ví dụ: 💉, 🏥)',
                      admin: { width: '30%' },
                    },
                    {
                      name: 'iconImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Hoặc ảnh icon (ưu tiên hơn emoji)',
                      admin: { width: '70%' },
                    },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Tiêu đề mục',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Mô tả ngắn',
                },
                {
                  name: 'linkUrl',
                  type: 'text',
                  label: 'Đường dẫn (để trống nếu không có link)',
                  admin: {
                    description: 'Nếu điền, mục này sẽ có nút mũi tên và có thể nhấn vào.',
                  },
                },
              ],
            },
            {
              name: 'transparentBackground',
              type: 'checkbox',
              label: 'Giao diện trong suốt (Xóa nền trắng và viền)',
              defaultValue: false,
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'manual',
                description: 'Dùng khi bạn chỉ chèn một video hoặc hình ảnh và không muốn có nền trắng xung quanh.',
              },
            },
            {
              name: 'article',
              type: 'relationship',
              relationTo: 'articles',
              label: 'Chọn Bài viết',
              hasMany: false,
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'article',
                description: 'Hệ thống sẽ lấy Tiêu đề, Ảnh đại diện, Mô tả ngắn và tự động gắn link "Đọc tiếp" trỏ đến bài viết này.',
              },
            },
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề thông báo',
              defaultValue: 'THÔNG BÁO QUAN TRỌNG',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type !== 'article',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh banner minh họa',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type !== 'article',
                description: 'Hiển thị ở trên cùng của popup. Kích thước khuyến nghị: ngang (landscape).',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              label: 'Đường dẫn Video (YouTube, MP4...)',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type !== 'article',
                description: 'Nhập link YouTube để hiển thị video trên cùng của popup (thay vì hình ảnh tĩnh)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Nội dung chi tiết',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  BlocksFeature({
                    blocks: [
                      VideoBlock,
                      EmbedBlock,
                      TikTokBlock,
                    ],
                  }),
                ],
              }),
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type !== 'article',
              },
            },
            {
              name: 'linkUrl',
              type: 'text',
              label: 'Đường dẫn chuyển hướng (URL)',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type !== 'article',
                description: 'Nếu điền, sẽ có nút "Tìm hiểu thêm" để người dùng bấm vào xem chi tiết.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'delaySeconds',
                  type: 'number',
                  label: 'Thời gian trễ (giây)',
                  defaultValue: 1,
                  min: 0,
                  max: 30,
                  admin: {
                    condition: (data) => data?.popup?.enabled,
                    description: 'Chờ bao nhiêu giây sau khi trang tải xong mới hiện popup.',
                  },
                },
                {
                  name: 'showOnce',
                  type: 'checkbox',
                  label: 'Chỉ hiển thị 1 lần cho mỗi người dùng',
                  defaultValue: true,
                  admin: {
                    condition: (data) => data?.popup?.enabled,
                    description: 'Khi bật, nếu người dùng đã đóng popup, lần sau truy cập sẽ không hiện lại để tránh phiền hà (lưu qua localStorage).',
                  },
                },
              ]
            },
          ],
        },

        // ─────────────────────────────────────────────
        {
          type: 'group',
          label: 'Phân cảnh báo quan trọng',
          name: 'warningSection',
          fields: [
            {
              name: 'isEnabled',
              type: 'checkbox',
              label: 'Hi\u1ec3n th\u1ecb c\u1ea3nh b\u00e1o quan tr\u1ecdng',
              defaultValue: true,
              admin: {
                description: 'B\u1eadt/t\u1eaft to\u00e0n b\u1ed9 c\u1ed9t C\u1ea3nh b\u00e1o quan tr\u1ecdng b\u00ean ph\u1ea3i slider trang ch\u1ee7.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Biểu tượng (Icon)',
                  defaultValue: '🔥',
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Tiêu đề cảnh báo',
                  defaultValue: 'Cảnh báo quan trọng',
                },
              ]
            },
            {
              name: 'videos',
              type: 'relationship',
              relationTo: 'videos',
              hasMany: true,
              label: 'Danh sách Video cảnh báo',
            }
          ]
        },

        // ─────────────────────────────────────────────,
            {
          type: 'group',
          label: 'Zalo Mini App',
          name: 'zaloMiniApp',
          fields: [
            {
              name: 'themeColor',
              type: 'text',
              label: 'Màu chủ đạo (Hex)',
              defaultValue: '#007a8c',
              admin: {
                description: 'Mã màu Hex cho Mini App (VD: #007a8c, #00a651)',
              },
            },
            {
              name: 'bannerImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Ảnh Banner Trang chủ',
            },
            {
              name: 'features',
              type: 'group',
              label: 'Bật/Tắt Tính năng',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'enableAppointments',
                      type: 'checkbox',
                      label: 'Cho phép Đặt lịch khám',
                      defaultValue: true,
                    },
                    {
                      name: 'enableTestResults',
                      type: 'checkbox',
                      label: 'Cho phép Tra cứu kết quả xét nghiệm',
                      defaultValue: true,
                    },
                  ]
                },
              ]
            },
            {
              name: 'hotline',
              type: 'text',
              label: 'Số điện thoại Hotline Zalo',
              defaultValue: '1900988975',
            }
          ],
        },
        // ─────────────────────────────────────────────
          ]
        }

      ],
    },
  ],
};

import type { GlobalConfig } from 'payload';
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { EmbedBlock } from '../blocks/EmbedBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cài đặt trang web',
  admin: {
    group: 'Tài nguyên & Giao diện',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }: any) => (Array.isArray(user?.role) ? user.role.includes('admin') : user?.role === 'admin'),
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag, revalidatePath } = await import('next/cache');
          revalidateTag('site-settings');
          revalidatePath('/', 'layout');
        } catch (e) {
          // ignore in environments where next/cache is not available
        }
      },
    ],
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

        // ─────────────────────────────────────────────
            {
          type: 'collapsible',
          label: 'Bố cục & Nội dung Trang chủ',
          fields: [
            {
              name: 'homeContent',
              type: 'richText',
              label: 'Nội dung tùy chỉnh bổ sung trang chủ',
              admin: {
                description: 'Hiển thị ngay dưới slider banner trang chủ (nếu có nội dung).',
              },
            },
            {
              name: 'homeSections',
              type: 'blocks',
              label: 'Các khối thành phần trên Trang chủ',
              labels: {
                singular: 'Khối thành phần',
                plural: 'Danh sách khối thành phần trang chủ',
              },
              admin: {
                description: 'Kéo thả để sắp xếp lại thứ tự hiển thị các khối nội dung trên trang chủ.',
              },
              blocks: [
                {
                  slug: 'commitmentSection',
                  labels: {
                    singular: 'Cam kết chất lượng 4 tiêu chí',
                    plural: 'Cam kết chất lượng',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      label: 'Bật hiển thị',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  slug: 'productSection',
                  labels: {
                    singular: 'Khối Sản phẩm Rau An Toàn',
                    plural: 'Khối Sản phẩm Rau',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề khối',
                      defaultValue: 'Nông Sản & Rau Củ Tươi Sạch Trong Ngày',
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Mô tả phụ',
                      defaultValue: '100% đạt chuẩn VietGAP, thu hoạch từ vườn sớm mỗi sáng',
                    },
                    {
                      name: 'categoryFilter',
                      type: 'select',
                      label: 'Lọc theo danh mục rau',
                      defaultValue: 'all',
                      options: [
                        { label: 'Tất cả nông sản', value: 'all' },
                        { label: '🌿 Rau ăn lá', value: 'rau-an-la' },
                        { label: '🥕 Rau ăn củ, quả', value: 'rau-an-cu-qua' },
                        { label: '🌱 Rau mầm & Thủy canh', value: 'rau-mam-thuy-canh' },
                        { label: '🧄 Rau gia vị & Rau thơm', value: 'rau-gia-vi' },
                        { label: '🍄 Nấm tươi sạch', value: 'nam-tuoi' },
                        { label: '🍎 Trái cây & Nông sản theo mùa', value: 'trai-cay-theo-mua' },
                      ],
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng sản phẩm hiển thị',
                      defaultValue: 8,
                    },
                  ],
                },
                {
                  slug: 'processStepsSection',
                  labels: {
                    singular: 'Quy trình canh tác an toàn 4 bước',
                    plural: 'Quy trình canh tác',
                  },
                  fields: [],
                },
                {
                  slug: 'certificatesSection',
                  labels: {
                    singular: 'Chứng nhận & Kiểm định ATVSTP',
                    plural: 'Chứng nhận ATVSTP',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề khối',
                      defaultValue: 'Chứng nhận Chất lượng & Kiểm định ATVSTP',
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Mô tả phụ',
                      defaultValue: 'Minh bạch nguồn gốc, kiểm nghiệm định kỳ, an toàn tuyệt đối',
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng chứng nhận hiển thị',
                      defaultValue: 6,
                    },
                  ],
                },
                {
                  slug: 'latestNewsSection',
                  labels: {
                    singular: 'Tin tức mới nhất',
                    plural: 'Tin tức mới nhất',
                  },
                  fields: [
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng tin',
                      defaultValue: 6,
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      label: 'Bố cục',
                      defaultValue: 'grid',
                      options: [
                        { label: 'Lưới tin tức (Grid)', value: 'grid' },
                        { label: 'Slider trượt (Carousel)', value: 'slider' },
                        { label: 'Danh sách chi tiết (List)', value: 'list' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'newsCategorySection',
                  labels: {
                    singular: 'Tin tức theo chuyên mục',
                    plural: 'Tin theo chuyên mục',
                  },
                  fields: [
                    {
                      name: 'category',
                      type: 'relationship',
                      relationTo: 'categories',
                      required: true,
                      label: 'Chuyên mục bài viết',
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng tin',
                      defaultValue: 6,
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      label: 'Bố cục',
                      defaultValue: 'grid',
                      options: [
                        { label: 'Lưới tin tức (Grid)', value: 'grid' },
                        { label: 'Slider trượt (Carousel)', value: 'slider' },
                        { label: 'Danh sách chi tiết (List)', value: 'list' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'bannerSection',
                  labels: {
                    singular: 'Banner đơn giữa trang',
                    plural: 'Banner đơn',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                      label: 'Ảnh Banner',
                    },
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề',
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      label: 'Mô tả phụ',
                    },
                    {
                      name: 'linkUrl',
                      type: 'text',
                      label: 'Đường dẫn liên kết',
                    },
                    {
                      name: 'openInNewTab',
                      type: 'checkbox',
                      label: 'Mở tab mới',
                      defaultValue: false,
                    },
                    {
                      name: 'style',
                      type: 'select',
                      label: 'Kiểu hiển thị',
                      defaultValue: 'default',
                      options: [
                        { label: 'Mặc định', value: 'default' },
                        { label: 'Tràn viền', value: 'full' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'multiBannerSection',
                  labels: {
                    singular: 'Khối nhiều Banner hàng ngang',
                    plural: 'Khối nhiều Banner',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề',
                    },
                    {
                      name: 'columns',
                      type: 'number',
                      label: 'Số cột',
                      defaultValue: 3,
                    },
                    {
                      name: 'bannerHeight',
                      type: 'number',
                      label: 'Chiều cao (px)',
                    },
                    {
                      name: 'banners',
                      type: 'array',
                      label: 'Danh sách Banner',
                      fields: [
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                          label: 'Ảnh Banner',
                        },
                        {
                          name: 'linkUrl',
                          type: 'text',
                          label: 'Liên kết',
                        },
                        {
                          name: 'openInNewTab',
                          type: 'checkbox',
                          label: 'Mở tab mới',
                          defaultValue: false,
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'videoSection',
                  labels: {
                    singular: 'Video nông trại',
                    plural: 'Video nông trại',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề khối',
                      defaultValue: 'Video Từ Đồng Ruộng & Kỹ Thuật Trồng',
                    },
                    {
                      name: 'sourceType',
                      type: 'select',
                      label: 'Nguồn video',
                      defaultValue: 'all',
                      options: [
                        { label: 'Tất cả video mới nhất', value: 'all' },
                        { label: 'Theo kênh', value: 'channels' },
                        { label: 'Chọn thủ công', value: 'manual' },
                      ],
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng video',
                      defaultValue: 4,
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      label: 'Bố cục',
                      defaultValue: 'grid',
                      options: [
                        { label: 'Lưới', value: 'grid' },
                        { label: 'Slider', value: 'slider' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'statsSection',
                  labels: {
                    singular: 'Khối số liệu thống kê',
                    plural: 'Số liệu thống kê',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề khối',
                      defaultValue: 'Con Số Ấn Tượng Của Hợp Tác Xã',
                    },
                    {
                      name: 'backgroundColor',
                      type: 'text',
                      label: 'Màu nền',
                      defaultValue: '#f8fafc',
                    },
                    {
                      name: 'stats',
                      type: 'array',
                      label: 'Danh sách con số',
                      fields: [
                        {
                          name: 'icon',
                          type: 'text',
                          label: 'Icon (Emoji)',
                        },
                        {
                          name: 'value',
                          type: 'text',
                          label: 'Số liệu (VD: 50+ Ha, 100% Sạch, 10.000+ Khách hàng)',
                          required: true,
                        },
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Ý nghĩa / Tên chỉ số',
                          required: true,
                        },
                        {
                          name: 'suffix',
                          type: 'text',
                          label: 'Hậu tố (VD: +, %)',
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'quickLinksSection',
                  labels: {
                    singular: 'Khối liên kết nhanh',
                    plural: 'Liên kết nhanh',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề khối',
                      defaultValue: 'Liên Kết Nhanh',
                    },
                    {
                      name: 'links',
                      type: 'array',
                      label: 'Danh sách liên kết',
                      fields: [
                        {
                          name: 'icon',
                          type: 'text',
                          label: 'Icon (Emoji)',
                        },
                        {
                          name: 'label',
                          type: 'text',
                          label: 'Nhãn hiển thị',
                          required: true,
                        },
                        {
                          name: 'url',
                          type: 'text',
                          label: 'Đường dẫn liên kết',
                          required: true,
                        },
                        {
                          name: 'openInNewTab',
                          type: 'checkbox',
                          label: 'Mở tab mới',
                          defaultValue: false,
                        },
                        {
                          name: 'color',
                          type: 'text',
                          label: 'Màu sắc (Hex)',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
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
                    { name: 'zalo', type: 'text', label: 'Zalo URL' },
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
                      defaultValue: '© {year} Bản quyền thuộc về TRANG TRẠI NÔNG SẢN SẠCH & RAU AN TOÀN VIETGAP',
                      admin: {
                        description: 'Sử dụng {year} để tự động hiển thị năm hiện tại.',
                      },
                    },
                    {
                      name: 'designerCredit',
                      type: 'text',
                      label: 'Thông tin thiết kế',
                      defaultValue: 'Tươi Sạch Từ Nông Trại Đến Bàn Ăn',
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
                        { label: '🌿 Sản phẩm rau sạch', value: '/san-pham' },
                        { label: '📰 Tin tức & Kiến thức', value: '/bai-viet' },
                        { label: '🎬 Video nông trại', value: '/video' },
                        { label: '📞 Liên hệ & Báo giá sỉ', value: '/contact' },
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
                        { label: '🌿 Sản phẩm rau sạch', value: '/san-pham' },
                        { label: '📰 Tin tức & Kiến thức', value: '/bai-viet' },
                        { label: '🎬 Video nông trại', value: '/video' },
                        { label: '📞 Liên hệ & Báo giá sỉ', value: '/contact' },
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
        // ─────────────────────────────────────────────
            {
          type: 'collapsible',
          label: 'Cấu hình Nâng cao',
          fields: [
            {
              name: 'themeConfig',
              type: 'group',
              label: 'Màu sắc & Giao diện',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'primaryColor',
                      type: 'text',
                      label: 'Màu chủ đạo (Hex)',
                      defaultValue: '#15803d',
                      admin: {
                        description: 'Mã màu Hex (VD: #15803d cho màu xanh lá nông nghiệp)',
                      },
                    },
                    {
                      name: 'primaryDarkColor',
                      type: 'text',
                      label: 'Màu chủ đạo đậm (Hex)',
                      defaultValue: '#14532d',
                    },
                    {
                      name: 'secondaryColor',
                      type: 'text',
                      label: 'Màu phụ (Hex)',
                      defaultValue: '#16a34a',
                    },
                    {
                      name: 'fontFamily',
                      type: 'text',
                      label: 'Font chữ',
                    },
                  ],
                },
              ],
            },
            {
              name: 'sidebarWidgets',
              type: 'blocks',
              label: 'Widget thanh bên (Sidebar)',
              blocks: [
                {
                  slug: 'categoriesWidget',
                  labels: {
                    singular: 'Widget Danh mục',
                    plural: 'Widget Danh mục',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề Widget',
                      defaultValue: 'Danh Mục Nông Sản',
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng danh mục',
                      defaultValue: 10,
                    },
                  ],
                },
                {
                  slug: 'recentArticlesWidget',
                  labels: {
                    singular: 'Widget Bài viết mới',
                    plural: 'Widget Bài viết mới',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề Widget',
                      defaultValue: 'Tin Tức Mới Nhất',
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      label: 'Số lượng bài viết',
                      defaultValue: 5,
                    },
                  ],
                },
                {
                  slug: 'bannerWidget',
                  labels: {
                    singular: 'Widget Banner quảng cáo',
                    plural: 'Widget Banner',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                      label: 'Ảnh Banner',
                    },
                    {
                      name: 'linkUrl',
                      type: 'text',
                      label: 'Link liên kết',
                    },
                  ],
                },
                {
                  slug: 'customHtmlWidget',
                  labels: {
                    singular: 'Widget HTML tùy biến',
                    plural: 'Widget HTML',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Tiêu đề',
                    },
                    {
                      name: 'htmlContent',
                      type: 'textarea',
                      label: 'Mã HTML / Nhúng',
                    },
                  ],
                },
              ],
            },
          ],
        },
          ]
        },
        {
          label: 'Tính năng mở rộng',
          fields: [
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
              defaultValue: 'Thông báo & Ưu đãi Nông Sản Sạch VietGAP',
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
              defaultValue: '#15803d',
              admin: {
                condition: (data) => data?.popup?.enabled && data?.popup?.type === 'services',
                description: 'Màu nền của banner tiêu đề. Ví dụ: #15803d, #14532d',
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
              ],
            },
          ],
        },
      ],
    },

    // ─── Tab Thanh Toán & Đặt Hàng ────────────────────────────────────────
    {
      name: 'payment',
      label: '💳 Thanh Toán & Đặt Hàng',
      fields: [
        {
          type: 'group',
          name: 'payment',
          label: 'Thông tin Thanh Toán Chuyển Khoản',
          fields: [
            {
              name: 'bankName',
              type: 'text',
              label: 'Tên ngân hàng',
              admin: {
                placeholder: 'VD: Vietcombank, Techcombank, MBBank...',
              },
            },
            {
              name: 'bankAccount',
              type: 'text',
              label: 'Số tài khoản',
              admin: {
                placeholder: 'VD: 1234567890',
              },
            },
            {
              name: 'bankOwner',
              type: 'text',
              label: 'Chủ tài khoản',
              admin: {
                placeholder: 'VD: HTX DICH VU SAN XUAT VA TIEU THU RAU TUY LOAN',
              },
            },
            {
              name: 'qrImageUrl',
              type: 'text',
              label: 'URL ảnh QR Code chuyển khoản',
              admin: {
                placeholder: 'https://img.vietqr.io/image/...',
                description: 'Ảnh QR chuyển khoản sẽ hiển thị trên trang đặt hàng khi khách chọn thanh toán chuyển khoản. Dùng VietQR (img.vietqr.io) để tạo QR miễn phí.',
              },
            },
          ],
        },
        {
          type: 'group',
          name: 'notifications',
          label: '📧 Thông Báo Đơn Hàng',
          fields: [
            {
              name: 'telegramBotToken',
              type: 'text',
              label: 'Telegram Bot Token',
              admin: {
                placeholder: 'VD: 7123456789:AAFxxxxxx',
                description: 'Token của Bot Telegram tạo từ @BotFather.',
              },
            },
            {
              name: 'telegramChatId',
              type: 'text',
              label: 'Telegram Chat ID nhận thông báo',
              admin: {
                placeholder: 'VD: -100123456789',
                description: 'Chat ID của nhóm hoặc cá nhân sẽ nhận thông báo đơn hàng.',
              },
            },
            {
              name: 'smtpHost',
              type: 'text',
              label: 'SMTP Host',
              defaultValue: 'smtp.gmail.com',
              admin: {
                placeholder: 'VD: smtp.gmail.com',
                description: 'Máy chủ gửi email (Mặc định: smtp.gmail.com).',
              },
            },
            {
              name: 'smtpPort',
              type: 'number',
              label: 'SMTP Port',
              defaultValue: 587,
              admin: {
                placeholder: 'VD: 587',
                description: 'Cổng kết nối SMTP (Thường là 587 hoặc 465).',
              },
            },
            {
              name: 'smtpSecure',
              type: 'checkbox',
              label: 'SMTP Secure (SSL/TLS)',
              defaultValue: false,
              admin: {
                description: 'Chọn nếu sử dụng cổng 465.',
              },
            },
            {
              name: 'smtpUser',
              type: 'text',
              label: 'SMTP User (Email gửi)',
              admin: {
                placeholder: 'VD: your@gmail.com',
                description: 'Địa chỉ email dùng để gửi thư.',
              },
            },
            {
              name: 'smtpPass',
              type: 'text',
              label: 'SMTP Password (Mật khẩu ứng dụng)',
              admin: {
                placeholder: 'VD: xxxxxxxxxxxxxxxx',
                description: 'Mật khẩu ứng dụng (App Password) của Gmail, KHÔNG phải mật khẩu đăng nhập thông thường.',
              },
            },
            {
              name: 'adminEmail',
              type: 'email',
              label: 'Email nhận thông báo đơn hàng',
              admin: {
                placeholder: 'VD: htxtuyloandanang@gmail.com',
                description: 'Email quản trị viên sẽ nhận thông báo khi có đơn hàng mới từ website.',
              },
            },
          ],
        },
      ],
    },

  ],
},
],
};

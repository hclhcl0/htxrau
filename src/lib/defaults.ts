/**
 * DEFAULT SITE DATA — lấy từ database local (payload-data.db)
 * Dùng làm fallback khi DB chưa seed hoặc query thất bại.
 * Cập nhật lần cuối: 2026-08-23
 */

// ─── Site Settings ────────────────────────────────────────────────────────────
export const DEFAULT_SITE_SETTINGS = {
  // Header
  siteName: 'HỢP TÁC XÃ RAU AN TOÀN TÚY LOAN',
  logoUrl: '/media/logo.webp',

  header: {
    siteName: 'HỢP TÁC XÃ RAU AN TOÀN TÚY LOAN',
    logo: { url: '/media/logo.webp' },
    hotline: {
      phone: '0905546207',
      actionLink: 'tel:0905559206',
      position: 'topbar',
    },
    socialLinks: {
      facebook: null,
      youtube: null,
      twitter: null,
      instagram: null,
      zalo: null,
    },
    logoCustomization: {
      logoHeight: 80,
      logoPosition: 'left',
      showSiteName: true,
      siteNameLine1: 'HỢP TÁC XÃ DỊCH VỤ SẢN XUẤT & TIÊU THỤ',
      siteNameLine2: 'RAU AN TOÀN TÚY LOAN',
      siteTagline: 'Giao chất lượng - Nhận niềm tin | Chuẩn VietGAP & OCOP Đà Nẵng',
      logoBannerImage: null,
      mobileLogo: null,
      mobileLogoHeight: 40,
      mobileShowSiteName: false,
      logoHoverEffect: 'bounce',
    },
    searchCustomization: {
      position: 'navbar',
      style: 'popup',
      width: 250,
    },
  },

  menu: {
    menuPosition: 'below',
    navStyle: 'white',
    menuItems: [
      { id: '1', label: 'Trang chủ', url: '/', openInNewTab: false },
      { id: '2', label: 'Sản phẩm rau sạch', url: '/san-pham', openInNewTab: false },
      { id: '3', label: 'Tin tức & Kiến thức', url: '/bai-viet', openInNewTab: false },
      { id: '4', label: 'Video nông trại', url: '/video', openInNewTab: false },
      { id: '5', label: 'Liên hệ & Đặt hàng', url: '/contact', openInNewTab: false },
    ],
  },

  footer: {
    aboutText:
      'Hợp tác xã Dịch vụ Sản xuất và Tiêu thụ Rau an toàn Túy Loan - Vùng chuyên canh 8 ha rau sạch bên dòng sông Túy Loan, đạt chuẩn VietGAP và OCOP 3 sao TP. Đà Nẵng.',
    addressMain: 'Thôn Túy Loan Tây, xã Hòa Vang, TP. Đà Nẵng',
    addressSub: '',
    phone: '0905 546 207 - 0903 596 767',
    email: 'rauantoantuyloan@gmail.com',
    copyrightText: `© ${new Date().getFullYear()} Bản quyền thuộc về HTX SẢN XUẤT VÀ TIÊU THỤ RAU AN TOÀN TÚY LOAN`,
    designerCredit: 'Rau an toàn Đà Nẵng - OCOP 3 sao',
    quickLinks: [
      { id: '1', label: 'Trang chủ', url: '/' },
      { id: '2', label: 'Sản phẩm rau sạch', url: '/san-pham' },
      { id: '3', label: 'Tin tức & Kiến thức', url: '/bai-viet' },
      { id: '4', label: 'Video nông trại', url: '/video' },
      { id: '5', label: 'Liên hệ & Báo giá sỉ', url: '/contact' },
    ],
    socialLinks: [] as { platform: string; label: string; url: string }[],
  },

  // Theme
  theme: {
    primaryColor: '#15803d',
    primaryDarkColor: '#14532d',
    secondaryColor: '#16a34a',
    fontFamily: 'Inter',
  },

  // Banner slider
  banner: {
    heroSliderSize: 'medium',
    heroSliderEffect: 'slide',
    heroSliderAutoplayDelay: 5000,
  },

  // Popup (tắt mặc định)
  popup: {
    enabled: false,
  },
};

// ─── Shortcut getters ─────────────────────────────────────────────────────────
export const DEFAULT_HEADER = DEFAULT_SITE_SETTINGS.header;
export const DEFAULT_MENU = DEFAULT_SITE_SETTINGS.menu;
export const DEFAULT_FOOTER = DEFAULT_SITE_SETTINGS.footer;

/** Lấy settings với fallback — dùng trong server components */
export function withDefaults<T extends Record<string, any>>(
  data: T | null | undefined,
  defaults: T,
): T {
  if (!data) return defaults;
  const result = { ...defaults, ...data };
  return result;
}

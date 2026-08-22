import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { HeaderClient } from './HeaderClient';
import styles from './Header.module.css';

// Cache site-settings 60 giây — giảm DB query từ mỗi request → 1 lần/phút
const getCachedSettings = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise });
    return payload.findGlobal({ slug: 'site-settings', depth: 2 });
  },
  ['site-settings-header'],
  { revalidate: 60, tags: ['site-settings'] }
);

export const Header = async () => {
  let menuItems: any[] = [];
  let menuPosition = 'right';
  let logoConfig = {
    height: 52, position: 'left', showSiteName: true,
    line1: 'TRANG TRẠI NÔNG SẢN SẠCH', line2: 'RAU AN TOÀN VIETGAP',
    tagline: 'Tươi Sạch Từ Nông Trại Đến Bàn Ăn', bannerImageUrl: '', mobileLogoUrl: '',
    mobileHeight: 52, mobileShowSiteName: false, hoverEffect: 'scale-tilt',
  };
  let searchConfig = { position: 'hotline', style: 'inline', width: 250 };
  let fb: any, tw: any, yt: any, ig: any, zalo: any;
  let phone = '0905 123 456';
  let actionLink = '/contact';
  let hotlinePosition = 'below-nav';
  let logoUrl = '/logo.png';
  let siteName = 'Rau An Toàn VietGAP';
  let navStyle: 'white' | 'primary' | 'gradient' = 'white';

  try {
    const s = await getCachedSettings() as any;
    const headerData = s?.header || {};
    const menuData = s?.menu || {};
    menuItems = menuData?.menuItems || [];
    menuPosition = menuData?.menuPosition || 'right';
    navStyle = menuData?.navStyle || 'white';
    const lc = headerData.logoCustomization || {};
    logoConfig = {
      height: lc.logoHeight || 52,
      position: lc.logoPosition || 'left',
      showSiteName: lc.showSiteName !== false,
      line1: lc.siteNameLine1 || 'TRANG TRẠI NÔNG SẢN SẠCH',
      line2: lc.siteNameLine2 || 'RAU AN TOÀN VIETGAP',
      tagline: lc.siteTagline || '',
      bannerImageUrl: (lc.logoBannerImage as any)?.url || '',
      mobileLogoUrl: (lc.mobileLogo as any)?.url || '',
      mobileHeight: lc.mobileLogoHeight || 52,
      mobileShowSiteName: lc.mobileShowSiteName === true,
      hoverEffect: lc.logoHoverEffect || 'scale-tilt',
    };
    const sc = headerData.searchCustomization || {};
    searchConfig = { position: sc.position || 'hotline', style: sc.style || 'inline', width: sc.width || 250 };
    fb = headerData.socialLinks?.facebook;
    tw = headerData.socialLinks?.twitter;
    yt = headerData.socialLinks?.youtube;
    ig = headerData.socialLinks?.instagram;
    zalo = headerData.socialLinks?.zalo;
    phone = headerData.hotline?.phone || '0909 408 895';
    actionLink = headerData.hotline?.actionLink || '#';
    hotlinePosition = headerData.hotline?.position || 'below-nav';
    logoUrl = (headerData.logo as any)?.url || '/logo.png';
    siteName = headerData.siteName || 'Rau An Toàn VietGAP';

    if (!menuItems || menuItems.length === 0) {
      menuItems = [
        { label: 'Trang chủ', linkType: 'custom', url: '/' },
        { label: 'Sản phẩm rau sạch', linkType: 'custom', url: '/san-pham' },
        { label: '🛒 Đặt Hàng', linkType: 'custom', url: '/dat-hang' },
        { label: 'Tin tức & Kiến thức', linkType: 'custom', url: '/bai-viet' },
        { label: 'Video nông trại', linkType: 'custom', url: '/video' },
        { label: 'Liên hệ', linkType: 'custom', url: '/contact' },
      ];
    }
  } catch (e) {
    console.error('Header: error fetching global header data:', e);
  }

  return (
    <HeaderClient
      menuItems={menuItems}
      menuPosition={menuPosition}
      navStyle={navStyle}
      logoUrl={logoUrl}
      logoConfig={logoConfig}
      searchConfig={searchConfig}
      hotlinePosition={hotlinePosition}
      siteName={siteName}
      phone={phone}
      actionLink={actionLink}
      socials={{ fb, tw, yt, ig, zalo }}
    />
  );
};

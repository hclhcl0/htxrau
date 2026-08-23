import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { HeaderClient } from './HeaderClient';
import styles from './Header.module.css';
import { DEFAULT_HEADER, DEFAULT_MENU } from '@/lib/defaults';

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
  // ── Fallback mặc định từ dữ liệu local ────────────────────────────────────
  const lc = DEFAULT_HEADER.logoCustomization;
  let menuItems: any[] = DEFAULT_MENU.menuItems;
  let menuPosition = DEFAULT_MENU.menuPosition;
  let navStyle: 'white' | 'primary' | 'gradient' = DEFAULT_MENU.navStyle as any;
  let logoConfig = {
    height: lc.logoHeight,
    position: lc.logoPosition,
    showSiteName: lc.showSiteName,
    line1: lc.siteNameLine1,
    line2: lc.siteNameLine2,
    tagline: lc.siteTagline,
    bannerImageUrl: '',
    mobileLogoUrl: '',
    mobileHeight: lc.mobileLogoHeight,
    mobileShowSiteName: lc.mobileShowSiteName,
    hoverEffect: lc.logoHoverEffect,
  };
  let searchConfig = {
    position: DEFAULT_HEADER.searchCustomization.position,
    style: DEFAULT_HEADER.searchCustomization.style,
    width: DEFAULT_HEADER.searchCustomization.width,
  };
  let fb: any, tw: any, yt: any, ig: any, zalo: any;
  let phone = DEFAULT_HEADER.hotline.phone;
  let actionLink = DEFAULT_HEADER.hotline.actionLink;
  let hotlinePosition = DEFAULT_HEADER.hotline.position;
  let logoUrl = DEFAULT_HEADER.logo.url;
  let siteName = DEFAULT_HEADER.siteName;

  // ── Ghi đè bằng dữ liệu DB nếu có ────────────────────────────────────────
  try {
    const s = await getCachedSettings() as any;
    const headerData = s?.header || {};
    const menuData = s?.menu || {};

    const dbMenuItems = menuData?.menuItems;
    if (dbMenuItems && dbMenuItems.length > 0) {
      menuItems = dbMenuItems;
    }
    menuPosition = menuData?.menuPosition || menuPosition;
    navStyle = menuData?.navStyle || navStyle;

    const dbLc = headerData.logoCustomization || {};
    logoConfig = {
      height: dbLc.logoHeight || logoConfig.height,
      position: dbLc.logoPosition || logoConfig.position,
      showSiteName: dbLc.showSiteName !== undefined ? dbLc.showSiteName : logoConfig.showSiteName,
      line1: dbLc.siteNameLine1 || logoConfig.line1,
      line2: dbLc.siteNameLine2 || logoConfig.line2,
      tagline: dbLc.siteTagline !== undefined ? dbLc.siteTagline : logoConfig.tagline,
      bannerImageUrl: (dbLc.logoBannerImage as any)?.url || logoConfig.bannerImageUrl,
      mobileLogoUrl: (dbLc.mobileLogo as any)?.url || logoConfig.mobileLogoUrl,
      mobileHeight: dbLc.mobileLogoHeight || logoConfig.mobileHeight,
      mobileShowSiteName: dbLc.mobileShowSiteName === true,
      hoverEffect: dbLc.logoHoverEffect || logoConfig.hoverEffect,
    };
    const sc = headerData.searchCustomization || {};
    searchConfig = {
      position: sc.position || searchConfig.position,
      style: sc.style || searchConfig.style,
      width: sc.width || searchConfig.width,
    };
    fb = headerData.socialLinks?.facebook;
    tw = headerData.socialLinks?.twitter;
    yt = headerData.socialLinks?.youtube;
    ig = headerData.socialLinks?.instagram;
    zalo = headerData.socialLinks?.zalo;
    phone = headerData.hotline?.phone || phone;
    actionLink = headerData.hotline?.actionLink || actionLink;
    hotlinePosition = headerData.hotline?.position || hotlinePosition;
    logoUrl = (headerData.logo as any)?.url || logoUrl;
    siteName = headerData.siteName || siteName;
  } catch (e) {
    // DB unavailable — dùng fallback mặc định đã set ở trên
    console.warn('Header: using default fallback data');
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

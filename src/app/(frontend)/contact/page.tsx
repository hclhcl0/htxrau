import React from 'react';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ContactClient, type ContactPageData } from './ContactClient';

export const revalidate = 60; // Tự động làm mới cache sau 60s

export async function generateMetadata(): Promise<Metadata> {
  let title = 'Liên Hệ Đặt Hàng & Báo Giá Sỉ - HTX Rau An Toàn Túy Loan';
  let description = 'Cung cấp rau an toàn chuẩn VietGAP cho hộ gia đình, trường học, bếp ăn tập thể, nhà hàng và siêu thị với chính sách chiết khấu tốt nhất.';

  try {
    const payload = await getPayload({ config: configPromise });
    const siteSettings = (await payload.findGlobal({ slug: 'site-settings' })) as any;
    if (siteSettings?.contactPage?.bannerTitle) {
      title = `${siteSettings.contactPage.bannerTitle} - HTX Rau An Toàn Túy Loan`;
    }
    if (siteSettings?.contactPage?.bannerSubtitle) {
      description = siteSettings.contactPage.bannerSubtitle;
    }
  } catch (e) {
    // Ignore fallback
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function ContactPage() {
  let contactData: ContactPageData = {};

  try {
    const payload = await getPayload({ config: configPromise });
    const siteSettings = (await payload.findGlobal({ slug: 'site-settings' })) as any;
    if (siteSettings?.contactPage) {
      contactData = siteSettings.contactPage;
    }
  } catch (err) {
    console.error('Error fetching site-settings for contact page:', err);
  }

  return <ContactClient data={contactData} />;
}

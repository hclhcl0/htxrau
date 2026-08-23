import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

import { getMediaUrl } from '@/lib/mediaUrl';

export async function SidebarBanners() {
  try {
    const payload = await getPayload({ config: configPromise });
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    }) as any;

    const banners = siteSettings?.banner?.sidebarBanners || [];

    if (!banners || banners.length === 0) {
      return null;
    }

    return (
      <div className="hidden lg:flex flex-col gap-4 mt-6">
        {banners.map((item: any, idx: number) => {
          const imgUrl = getMediaUrl(item.image, '');
          const imgAlt = typeof item.image === 'object' ? item.image?.alt : '';
          
          if (!imgUrl) return null;

          const ImageTag = (
            <img 
              src={imgUrl} 
              alt={imgAlt || 'Sidebar Banner'} 
              className="w-full h-auto object-cover rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            />
          );

          return (
            <div key={idx} className="w-full">
              {item.url ? (
                <Link href={item.url} target={item.openInNewTab ? '_blank' : '_self'} rel="noopener noreferrer">
                  {ImageTag}
                </Link>
              ) : (
                ImageTag
              )}
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch sidebar banners:', error);
    return null;
  }
}

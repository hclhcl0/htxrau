import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/mediaUrl';

interface BannerItem {
  id: string;
  image: any;
  linkUrl?: string;
  openInNewTab?: boolean;
}

interface MultiBannerSectionProps {
  title?: string;
  columns?: number;
  bannerHeight?: number;
  banners: BannerItem[];
}

// Helper: kiểm tra URL nội bộ
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('htxrau.vercel.app');
}

export function MultiBannerSection({ title, columns = 4, bannerHeight, banners }: MultiBannerSectionProps) {
  if (!banners || banners.length === 0) return null;

  // Grid styling based on columns prop
  let gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; // default to 4 on large screens
  
  if (columns === 2) gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
  else if (columns === 3) gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
  else if (columns === 4) gridColsClass = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4';
  else if (columns === 5) gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
  else if (columns === 6) gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';

  // Calculate dynamic aspect ratio from the first banner image
  const firstImage = banners[0]?.image;
  const dynamicAspectRatio = (firstImage?.width && firstImage?.height)
    ? `${firstImage.width}/${firstImage.height}`
    : '16/9';

  return (
    <section className="py-4 bg-white w-full">
      <div className="container mx-auto px-4">
        <div className="p-1 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
          {title && (
            <div className="global-section-header">
              <h2 className="global-section-title">
                {title}
              </h2>
            </div>
          )}

          <div className={`grid gap-1 ${gridColsClass}`}>
          {banners.map((item, index) => {
            const imageUrl = getMediaUrl(item.image, '');
            if (!imageUrl) return null;

            const target = item.openInNewTab ? '_blank' : '_self';
            
            const containerStyle: React.CSSProperties = bannerHeight 
              ? { height: `${bannerHeight}px` } 
              : { aspectRatio: dynamicAspectRatio };
            
            const content = (
              <div className="relative w-full overflow-hidden rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group" style={containerStyle}>
                <Image
                  src={imageUrl}
                  alt={item.image?.alt || `Banner ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes={`(max-width: 768px) 50vw, (max-width: 1024px) 33vw, ${Math.floor(100 / columns)}vw`}
                  unoptimized={!isInternalUrl(imageUrl)}
                />
              </div>
            );

            if (item.linkUrl) {
              // Internal link
              if (isInternalUrl(item.linkUrl) && !item.openInNewTab) {
                return (
                  <Link key={item.id || index} href={item.linkUrl} className="block w-full h-full">
                    {content}
                  </Link>
                );
              }
              // External link
              return (
                <a key={item.id || index} href={item.linkUrl} target={target} rel={target === '_blank' ? "noopener noreferrer" : undefined} className="block w-full h-full">
                  {content}
                </a>
              );
            }

            return (
              <div key={item.id || index} className="w-full h-full">
                {content}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}

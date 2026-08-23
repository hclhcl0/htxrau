"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Eye, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './NewsGrid.module.css';
import { getMediaUrl } from '@/lib/mediaUrl';

interface NewsGridSliderClientProps {
  articles: any[];
  desktopCols: number;
  mobileCols: number;
}

// Helper: kiểm tra URL nội bộ (relative) hay bên ngoài
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('htxrau.vercel.app');
}

export const NewsGridSliderClient = ({ articles, desktopCols, mobileCols }: NewsGridSliderClientProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 15000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className={styles.sliderWrapper}>
      <div 
        className={styles.embla} 
        ref={emblaRef}
        style={{
          '--desktop-cols': desktopCols,
          '--mobile-cols': mobileCols
        } as React.CSSProperties}
      >
        <div className={styles.emblaContainer}>
          {articles.map((article: any) => {
            const mediaUrl = getMediaUrl(article.image, '/placeholder-vegetable.svg');
            const catName = article.category?.name || 'Tin tức';

            return (
              <div key={article.id} className={styles.emblaSlide}>
                <article className={styles.card} style={{ height: '100%' }}>
                  <div className={styles.imageHolder}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {/* Phase 2: Dùng next/image với explicit width/height để an toàn SSG + WebP/resize */}
                      <Image
                        src={mediaUrl}
                        alt={article.title}
                        width={400}
                        height={240}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        unoptimized={!isInternalUrl(mediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>

                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={scrollPrev} 
        className={`${styles.navButton} ${styles.navButtonPrev}`}
        aria-label="Bài viết trước"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>
      <button 
        onClick={scrollNext} 
        className={`${styles.navButton} ${styles.navButtonNext}`}
        aria-label="Bài viết sau"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};

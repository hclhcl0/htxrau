'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { getMediaUrl } from '@/lib/mediaUrl';

export function SliderClientBlock({ images, autoplay }: { images: any[]; autoplay: boolean }) {
  const plugins = React.useMemo(() => {
    return autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: false })] : [];
  }, [autoplay]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (!images || images.length === 0) return null;

  return (
    <div className="my-8 relative group max-w-4xl mx-auto rounded-2xl overflow-hidden border border-gray-100 shadow-sm not-prose">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {images.map((item, index) => {
            const rawImg = item?.image || item;
            const url = getMediaUrl(rawImg, '');
            if (!url) return null;
            const altText = item?.caption || (typeof rawImg === 'object' ? rawImg.alt : '') || '';
            return (
              <div className="flex-[0_0_100%] min-w-0 relative" key={index}>
                <div className="aspect-[16/9] md:aspect-[21/9] w-full">
                  <img src={url} alt={altText} className="w-full h-full object-cover" />
                </div>
                {item?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 text-white">
                    <p className="text-sm md:text-base font-medium m-0">{item.caption}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Nút điều hướng */}
      <button 
        onClick={scrollPrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/90 text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm"
      >
        ←
      </button>
      <button 
        onClick={scrollNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/90 text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm"
      >
        →
      </button>
    </div>
  );
}

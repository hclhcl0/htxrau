"use client";

import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { VideoCardPopup } from '../HomeSections/VideoCardPopup';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  videos: any[];
}

export const WarningVideosClient = ({ videos }: Props) => {
  const plugins = React.useMemo(() => [Autoplay({ delay: 3500, stopOnInteraction: false })], []);
  
  // Hiển thị 2 video trên desktop
  const emblaOptions = {
    loop: false,
    align: 'start' as const,
    slidesToScroll: 1,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="relative group w-full h-full flex flex-col">
      <div className="flex-1 relative min-h-0">
        <div className="overflow-hidden lg:absolute lg:inset-0" ref={emblaRef}>
          <div className="flex lg:h-full" style={{ marginLeft: '-4px' }}>
            {videos.map((video, index) => (
              <div 
                key={video.id || index} 
                className="relative flex-shrink-0 w-20 sm:w-24 md:w-28 lg:w-auto lg:h-full"
                style={{ paddingLeft: '4px' }}
              >
                <div 
                  className="w-full h-auto aspect-[3/4] lg:h-full lg:w-auto lg:aspect-[9/16]" 
                >
                  <VideoCardPopup video={video} videoList={videos} initialIndex={index} variant="vertical" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Nút điều hướng */}
      <button 
        onClick={scrollPrev}
        className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-orange-100 disabled:opacity-0"
        disabled={!canScrollPrev}
      >
        <ChevronLeft size={18} />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-orange-100 disabled:opacity-0"
        disabled={!canScrollNext}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Download, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { getMediaUrl } from '@/lib/mediaUrl';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

export type MagazineClientProps = {
  title: string;
  subtitle?: string;
  description?: string;
  coverImage: any;
  pdfFile?: any;
  magazinePages?: Array<{
    id?: string;
    pageImage?: any;
  }>;
};

export const MagazineClient: React.FC<MagazineClientProps> = ({
  title,
  subtitle,
  description,
  coverImage,
  pdfFile,
  magazinePages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const hasPages = magazinePages && magazinePages.length > 0;
  const pdfUrl = pdfFile?.url;

  return (
    <div className="relative">
      {/* Magazine Card */}
      <div className="flex flex-col md:flex-row items-center gap-12 bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-700">
        <div className="w-full md:w-1/3 flex justify-center">
          <div 
            className="relative group cursor-pointer transition-transform duration-500 hover:-translate-y-2 hover:scale-105"
            onClick={() => hasPages ? setIsOpen(true) : (pdfUrl && window.open(pdfUrl, '_blank'))}
          >
            {/* Book Spine Effect */}
            <div className="absolute -left-2 top-0 bottom-0 w-4 bg-gray-300 dark:bg-zinc-600 rounded-l-md shadow-inner transform -skew-y-[20deg]"></div>
            
            <div className="relative z-10 w-[240px] h-[340px] md:w-[280px] md:h-[396px] rounded-r-md shadow-2xl overflow-hidden bg-gray-200 dark:bg-zinc-700 border-l border-white/20">
              <img src={getMediaUrl(coverImage, '')} alt={coverImage?.alt || title} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {hasPages ? (
                  <div className="bg-white/90 text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 backdrop-blur-sm">
                    <BookOpen size={20} /> Đọc ngay
                  </div>
                ) : (
                  <div className="bg-white/90 text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 backdrop-blur-sm">
                    <Maximize2 size={20} /> Xem tài liệu
                  </div>
                )}
              </div>
            </div>
            
            {/* Pages Effect underneath */}
            <div className="absolute right-[-4px] top-[2%] bottom-[2%] w-2 bg-white border border-gray-200 rounded-r-sm shadow-sm z-0"></div>
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold tracking-wide uppercase">
            Tạp chí / Ấn phẩm
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
          
          {subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
          
          {description && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 pt-4">
            {hasPages && (
              <button
                onClick={() => setIsOpen(true)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
              >
                <BookOpen size={20} /> Đọc ấn phẩm
              </button>
            )}
            
            {pdfUrl && (
              <a
                href={pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="px-8 py-3 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-800 dark:text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download size={20} /> Tải PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Reading Modal */}
      <AnimatePresence>
        {isOpen && hasPages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 text-white bg-black/20">
              <div className="font-medium text-lg hidden md:block">{title} {subtitle ? `- ${subtitle}` : ''}</div>
              <div className="text-sm text-gray-400 block md:hidden">{title}</div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                  {currentIndex + 1} / {magazinePages.length}
                </span>
                
                {pdfUrl && (
                  <a href={pdfUrl} download target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Tải PDF">
                    <Download size={24} />
                  </a>
                )}
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Carousel Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <div className="overflow-hidden w-full max-w-5xl h-full flex items-center" ref={emblaRef}>
                <div className="flex w-full h-[85vh] items-center">
                  {magazinePages.map((page, index) => (
                    <div className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-2 md:p-8" key={page.id || index}>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                          src={getMediaUrl(page.pageImage, '')} 
                          alt={page.pageImage?.alt || `Trang ${index + 1}`}
                          className="max-w-full max-h-full object-contain rounded-sm shadow-2xl" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <button
                className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black text-white rounded-full transition-all disabled:opacity-0"
                onClick={scrollPrev}
                disabled={prevBtnDisabled}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black text-white rounded-full transition-all disabled:opacity-0"
                onClick={scrollNext}
                disabled={nextBtnDisabled}
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

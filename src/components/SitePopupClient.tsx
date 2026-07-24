'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function SitePopupClient({
  displayTitle,
  displayImage,
  displayLinkUrl,
  isArticle,
  articleDescription,
  renderedContent,
  delaySeconds,
  showOnce,
  transparentBackground,
  displayVideoUrl
}: {
  displayTitle: string | null | undefined;
  displayImage: any;
  displayLinkUrl: string | null | undefined;
  isArticle: boolean | null | undefined;
  articleDescription: string | null | undefined;
  renderedContent: React.ReactNode;
  delaySeconds: number | null | undefined;
  showOnce: boolean | null | undefined;
  transparentBackground?: boolean | null | undefined;
  displayVideoUrl?: string | null | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const closed = localStorage.getItem('cdc_popup_closed');
      if (closed === 'true') {
        return;
      }
    }

    const delay = (delaySeconds || 0) * 1000;
    const timer = setTimeout(() => {
      setShouldRender(true);
      setTimeout(() => setIsOpen(true), 10);
    }, delay);

    return () => clearTimeout(timer);
  }, [delaySeconds, showOnce]);

  const handleClose = () => {
    setIsOpen(false);
    if (showOnce) {
      localStorage.setItem('cdc_popup_closed', 'true');
    }
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={handleClose}
      />
      
      <div 
        className={`relative w-full max-w-xl mx-4 transform transition-transform duration-300 ease-out ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        {/* Nút đóng lồi ra ngoài góc trên bên phải */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-50 w-8 h-8 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-white rounded-full shadow-md transition-colors focus:outline-none"
          aria-label="Đóng thông báo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div 
          className={`flex flex-col overflow-hidden ${
            transparentBackground ? 'bg-transparent' : 'bg-white rounded-xl shadow-2xl'
          }`}
        >
          {displayVideoUrl ? (
            <div className="relative w-full aspect-video bg-black flex-shrink-0">
              <iframe
                src={displayVideoUrl.includes('youtube.com') || displayVideoUrl.includes('youtu.be') 
                  ? `https://www.youtube.com/embed/${
                      displayVideoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/) && 
                      displayVideoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2]?.length === 11
                        ? displayVideoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2]
                        : ''
                    }?autoplay=1&mute=1` 
                  : displayVideoUrl}
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          ) : displayImage?.url ? (
            <div className="relative w-full h-48 sm:h-64 md:h-72 bg-gray-100 flex-shrink-0">
              <Image
                src={displayImage.url}
                alt={displayImage.alt || displayTitle || 'Thông báo popup'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 36rem"
                priority
              />
            </div>
          ) : null}

          <div className={`flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar ${transparentBackground ? 'p-0' : 'p-6 sm:p-8'}`}>
            {displayTitle && !transparentBackground && (
              <h2 id="popup-title" className="text-lg sm:text-xl font-bold text-blue-600 mb-4 uppercase text-center">
                {displayTitle}
              </h2>
            )}

            {isArticle ? (
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 text-center mb-4">
                <p>{articleDescription || 'Vui lòng nhấn Đọc tiếp để xem chi tiết.'}</p>
              </div>
            ) : (
              renderedContent && (
                <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl text-gray-700 text-center">
                  {renderedContent}
                </div>
              )
            )}

            {displayLinkUrl && (
              <div className="mt-6 flex justify-center">
                <Link 
                  href={displayLinkUrl}
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow transition-all text-center w-full sm:w-auto"
                  onClick={handleClose}
                >
                  Đọc tiếp
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

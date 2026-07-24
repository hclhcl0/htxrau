'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '';
function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
}

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
  displayVideoUrl,
  mascotImage,
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
  mascotImage?: { url: string; alt?: string } | null;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showOnce && localStorage.getItem('cdc_popup_closed') === 'true') return;
    const delay = (delaySeconds || 0) * 1000;
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delaySeconds, showOnce]);

  const handleClose = () => {
    setIsVisible(false);
    if (showOnce) localStorage.setItem('cdc_popup_closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 cursor-pointer" onClick={handleClose} />

      <div
        className="relative w-full max-w-xl mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        style={{ marginTop: mascotImage?.url ? '48px' : '0' }}
      >
        {/* Mascot — góc trái trên, trượt lên từ phía sau */}
        {mascotImage?.url && (
          <div
            className="mascot-peek"
            style={{
              position: 'absolute',
              left: '12px',
              top: '-72px',
              zIndex: 20,
              width: 80,
              height: 90,
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          >
            <img
              src={resolveMediaUrl(mascotImage.url)}
              alt={mascotImage.alt || 'Bác sĩ'}
              className="mascot-glow"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-50 w-8 h-8 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-white rounded-full shadow-md focus:outline-none"
          aria-label="Đóng thông báo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={`flex flex-col overflow-hidden ${transparentBackground ? 'bg-transparent' : 'bg-white rounded-xl shadow-2xl'}`}>
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
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow text-center w-full sm:w-auto"
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

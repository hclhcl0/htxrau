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
  headerColor,
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
  headerColor?: string | null;
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

  const bgColor = headerColor || '#00a99d';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 cursor-pointer" onClick={handleClose} />

      {/* Popup wrapper */}
      <div className="relative z-10 w-full max-w-md mb-8 sm:mb-0">

        {/* ── CARD + MASCOT ── */}
        <div style={{ position: 'relative' }}>

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
                className="mascot-glow mascot-hover-scale"
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Capsule badge tiêu đề */}
          {displayTitle && !transparentBackground && (
            <div style={{
              position: 'absolute',
              top: '-22px',
              left: 0, right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 15,
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, #00c9b8 100%)`,
                borderRadius: '999px',
                padding: '9px 28px 9px',
                paddingLeft: mascotImage?.url ? '56px' : '28px',
                boxShadow: `0 4px 20px rgba(0,169,157,0.45), 0 2px 6px rgba(0,0,0,0.12)`,
                border: '2.5px solid rgba(255,255,255,0.6)',
                minWidth: '200px',
                textAlign: 'center',
              }}>
                <h2 id="popup-title" style={{
                  color: '#fff', fontWeight: 800, fontSize: '14px',
                  letterSpacing: '0.04em', textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  margin: 0, lineHeight: 1.3, textTransform: 'uppercase',
                }}>
                  {displayTitle}
                </h2>
              </div>
            </div>
          )}

          {/* ── CARD nền xanh nhẹ ── */}
          <div style={{
            background: transparentBackground
              ? 'transparent'
              : 'linear-gradient(160deg, #e8f8f7 0%, #f0fbfa 60%, #ffffff 100%)',
            borderRadius: '20px',
            boxShadow: transparentBackground ? 'none' : '0 8px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            border: transparentBackground ? 'none' : '1.5px solid rgba(0,169,157,0.15)',
          }}>

            {/* Nút đóng */}
            <button
              onClick={handleClose}
              aria-label="Đóng thông báo"
              style={{
                position: 'absolute', top: '-10px', right: '-10px', zIndex: 50,
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(120,120,120,0.9)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Padding top nhường chỗ capsule badge */}
            <div style={{ paddingTop: displayTitle && !transparentBackground ? '32px' : '16px' }}>

              {/* Video */}
              {displayVideoUrl && (
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
              )}

              {/* Ảnh */}
              {!displayVideoUrl && displayImage?.url && (
                <div style={{ position: 'relative', width: '100%', height: 200, background: '#f0f9f8' }}>
                  <Image
                    src={displayImage.url}
                    alt={displayImage.alt || displayTitle || 'Thông báo'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 28rem"
                    priority
                  />
                </div>
              )}

              {/* Nội dung */}
              <div className="px-5 pb-5 pt-3 max-h-[45vh] overflow-y-auto custom-scrollbar">
                {isArticle ? (
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    {articleDescription || 'Vui lòng nhấn Đọc tiếp để xem chi tiết.'}
                  </p>
                ) : (
                  renderedContent && (
                    <div className="prose prose-sm max-w-none prose-headings:text-gov-primary prose-a:text-gov-secondary prose-img:rounded-xl text-gray-700 text-center">
                      {renderedContent}
                    </div>
                  )
                )}

                {displayLinkUrl && (
                  <div className="mt-4 flex justify-center">
                    <Link
                      href={displayLinkUrl}
                      onClick={handleClose}
                      style={{
                        display: 'inline-block',
                        padding: '10px 32px',
                        background: `linear-gradient(135deg, ${bgColor} 0%, #00c9b8 100%)`,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '14px',
                        borderRadius: '999px',
                        boxShadow: '0 4px 14px rgba(0,169,157,0.4)',
                        textDecoration: 'none',
                      }}
                    >
                      Đọc tiếp
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Close button dưới card */}
        <div className="flex justify-center mt-5">
          <button
            onClick={handleClose}
            aria-label="Đóng popup"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" fill="none" stroke="#666" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

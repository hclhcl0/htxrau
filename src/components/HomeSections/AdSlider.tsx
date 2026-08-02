'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '';

function getUrl(img: any): string | null {
  if (!img) return null;
  const url = img.url || null;
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${SERVER_URL}${url}`;
}

interface AdSlide {
  image: any;
  linkUrl?: string;
  openInNewTab?: boolean;
  altText?: string;
}

interface AdSliderProps {
  slides: AdSlide[];
  title?: string;
  autoplayInterval?: number; // giây, 0 = tắt
}

export function AdSlider({ slides, title, autoplayInterval = 5 }: AdSliderProps) {
  const validSlides = slides.filter((s) => getUrl(s.image));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalMs = (autoplayInterval || 0) * 1000;

  const prev = useCallback(() => setActive((i) => (i - 1 + validSlides.length) % validSlides.length), [validSlides.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % validSlides.length), [validSlides.length]);

  const startTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused && intervalMs > 0 && validSlides.length > 1) {
      timerRef.current = setInterval(() => {
        setActive((i) => (i + 1) % validSlides.length);
      }, intervalMs);
    }
  }, [paused, intervalMs, validSlides.length]);

  useEffect(() => {
    startTimers();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimers]);

  if (!validSlides.length) return null;

  const slide = validSlides[active];
  const imgUrl = getUrl(slide.image)!;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Take the stretched height from HomeSectionRenderer
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tiêu đề */}
      {title && (
        <div style={{
          background: 'var(--primary, #1565c0)', color: '#fff',
          padding: '6px 12px', fontSize: 13, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: 0.5,
          borderRadius: '10px 10px 0 0',
        }}>
          {title}
        </div>
      )}

      {/* Ảnh + link */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {slide.linkUrl ? (
          <Link
            href={slide.linkUrl}
            target={slide.openInNewTab ? '_blank' : '_self'}
            rel={slide.openInNewTab ? 'noopener noreferrer' : undefined}
            style={{ display: 'flex', height: '100%' }}
          >
            <img
              src={imgUrl}
              alt={slide.altText || slide.image?.alt || `Quảng cáo ${active + 1}`}
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
                borderRadius: title ? '0 0 10px 10px' : '10px',
                border: '1px solid #e0e4ea',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                backgroundColor: '#fff',
              }}
            />
          </Link>
        ) : (
          <img
            src={imgUrl}
            alt={slide.altText || slide.image?.alt || `Quảng cáo ${active + 1}`}
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: title ? '0 0 10px 10px' : '10px',
              border: '1px solid #e0e4ea',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              backgroundColor: '#fff',
            }}
          />
        )}

        {/* Nút prev/next */}
        {validSlides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); startTimers(); }}
              style={{
                position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', padding: 0,
                opacity: paused ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: paused ? 'auto' : 'none'
              }}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); startTimers(); }}
              style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', padding: 0,
                opacity: paused ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: paused ? 'auto' : 'none'
              }}
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

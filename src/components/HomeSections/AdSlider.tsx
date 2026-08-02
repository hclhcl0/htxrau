'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
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
  matchHeight?: boolean; // Nếu true, tự động dãn chiều cao bằng container cha thay vì dùng tỉ lệ
}

export function AdSlider({ slides, title, autoplayInterval = 5, matchHeight = false }: AdSliderProps) {
  const validSlides = slides.filter((s) => getUrl(s.image));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalMs = (autoplayInterval || 0) * 1000;

  const prev = useCallback(() => setActive((i) => (i - 1 + validSlides.length) % validSlides.length), [validSlides.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % validSlides.length), [validSlides.length]);

  const startTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    if (!paused && intervalMs > 0 && validSlides.length > 1) {
      const step = 50;
      progressRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + (step / intervalMs) * 100, 100));
      }, step);
      timerRef.current = setInterval(() => {
        setActive((i) => (i + 1) % validSlides.length);
        setProgress(0);
      }, intervalMs);
    }
  }, [paused, intervalMs, validSlides.length]);

  useEffect(() => {
    startTimers();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [startTimers]);

  useEffect(() => { setProgress(0); }, [active]);

  if (!validSlides.length) return null;

  const slide = validSlides[active];
  const imgUrl = getUrl(slide.image)!;
  const imgW = slide.image?.width || 9;
  const imgH = slide.image?.height || 16;

  const ImageContent = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        ...(matchHeight ? { height: '100%', minHeight: 200 } : { aspectRatio: `${imgW}/${imgH}` }),
        overflow: 'hidden',
        borderRadius: 6,
        background: '#111',
        cursor: slide.linkUrl ? 'pointer' : 'default',
        flex: 1, // for column flex
      }}
    >
      <Image
        src={imgUrl}
        alt={slide.altText || slide.image?.alt || `Quảng cáo ${active + 1}`}
        fill
        sizes="(max-width: 1024px) 100vw, 220px"
        style={{ objectFit: 'cover' }}
        className="transition-opacity duration-300"
        priority={active === 0}
      />

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
  );

  return (
    <div
      style={{
        border: '1px solid #e0e4ea',
        borderRadius: 10,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        ...(matchHeight ? { height: '100%' } : {}),
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
        }}>
          {title}
        </div>
      )}

      {/* Ảnh + link */}
      <div style={{ padding: title ? '8px' : '0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {slide.linkUrl ? (
          <Link
            href={slide.linkUrl}
            target={slide.openInNewTab ? '_blank' : '_self'}
            rel={slide.openInNewTab ? 'noopener noreferrer' : undefined}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, textDecoration: 'none' }}
          >
            {ImageContent}
          </Link>
        ) : (
          ImageContent
        )}
      </div>
    </div>
  );
}

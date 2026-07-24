'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';

export interface ServiceItem {
  id?: string;
  icon?: string;
  iconImage?: { url: string; alt?: string } | null;
  title: string;
  description?: string;
  linkUrl?: string;
}

export function ServicesPopupClient({
  title,
  subtitle,
  mascotImage,
  headerColor,
  items,
  delaySeconds,
  showOnce,
  storageKey,
}: {
  title: string;
  subtitle?: string;
  mascotImage?: { url: string; alt?: string } | null;
  headerColor?: string;
  items: ServiceItem[];
  delaySeconds?: number;
  showOnce?: boolean;
  storageKey?: string;
}) {
  // Start as 'closed' — no flicker because opacity-0 from the start
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const key = storageKey || 'cdc_services_popup_closed';

  useEffect(() => {
    // Mark mounted (client-only)
    setIsMounted(true);

    if (showOnce) {
      const closed = localStorage.getItem(key);
      if (closed === 'true') return;
    }
    const delay = (delaySeconds ?? 1) * 1000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delaySeconds, showOnce, key]);

  const handleClose = () => {
    setIsVisible(false);
    if (showOnce) localStorage.setItem(key, 'true');
  };

  // Don't render at all on server to avoid hydration mismatch
  if (!isMounted) return null;

  const bgColor = headerColor || '#00a99d';

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 cursor-pointer"
        onClick={handleClose}
      />

      {/* Popup wrapper */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 mb-8 sm:mb-0 transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
        style={{ paddingTop: mascotImage?.url ? '64px' : '0' }}
      >
        {/* Sparkle stars around mascot */}
        {mascotImage?.url && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 pointer-events-none z-30">
            <span className="absolute top-2 left-4 text-yellow-300 text-lg" style={{ filter: 'drop-shadow(0 0 4px #facc15)' }}>★</span>
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-200 text-base" style={{ filter: 'drop-shadow(0 0 4px #fde68a)' }}>✦</span>
            <span className="absolute top-1 right-4 text-yellow-300 text-xl" style={{ filter: 'drop-shadow(0 0 4px #facc15)' }}>★</span>
            <span className="absolute top-10 left-1 text-yellow-200 text-sm" style={{ filter: 'drop-shadow(0 0 3px #fde68a)' }}>✦</span>
            <span className="absolute top-8 right-1 text-yellow-300 text-sm" style={{ filter: 'drop-shadow(0 0 3px #facc15)' }}>✦</span>

            {/* Mascot image */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 z-20 drop-shadow-2xl"
              style={{ width: 96, height: 96 }}
            >
              <Image
                src={mascotImage.url}
                alt={mascotImage.alt || 'Mascot'}
                fill
                className="object-contain"
                sizes="96px"
                priority
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">

          {/* Header banner with curved bottom */}
          <div
            className="relative text-center px-6"
            style={{
              background: bgColor,
              paddingTop: mascotImage?.url ? '56px' : '20px',
              paddingBottom: '0',
            }}
          >
            <h2 className="text-white font-bold text-lg leading-tight tracking-wide drop-shadow pb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/85 text-xs pb-3">{subtitle}</p>
            )}
            {/* Curved SVG bottom edge */}
            <svg
              viewBox="0 0 360 28"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 left-0 w-full"
              style={{ display: 'block', marginBottom: '-1px' }}
              preserveAspectRatio="none"
            >
              <path d="M0,0 Q180,28 360,0 L360,28 L0,28 Z" fill="white" />
            </svg>
          </div>

          {/* Items list */}
          <div className="px-4 pb-5 pt-3 flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto">
            {items.map((item, idx) => {
              const rowContent = (
                <div
                  className="flex items-center gap-3 bg-gray-50 hover:bg-teal-50 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 transition-colors group"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm text-2xl">
                    {item.iconImage?.url ? (
                      <Image
                        src={item.iconImage.url}
                        alt={item.iconImage.alt || item.title}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span>{item.icon || '🏥'}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow circle if has link */}
                  {item.linkUrl && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: bgColor }}
                    >
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  )}
                </div>
              );

              return item.linkUrl ? (
                <Link key={item.id || idx} href={item.linkUrl} onClick={handleClose}>
                  {rowContent}
                </Link>
              ) : (
                <div key={item.id || idx}>{rowContent}</div>
              );
            })}
          </div>
        </div>

        {/* Close button — below card */}
        <div className="flex justify-center mt-5">
          <button
            onClick={handleClose}
            aria-label="Đóng popup"
            className="w-11 h-11 rounded-full bg-white/95 shadow-xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

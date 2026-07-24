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
  const [isVisible, setIsVisible] = useState(false);
  const key = storageKey || 'cdc_services_popup_closed';

  useEffect(() => {
    if (showOnce && localStorage.getItem(key) === 'true') return;
    const delay = Math.max((delaySeconds ?? 1) * 1000, 100);
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delaySeconds, showOnce, key]);

  const handleClose = () => {
    setIsVisible(false);
    if (showOnce) localStorage.setItem(key, 'true');
  };

  if (!isVisible) return null;

  const bgColor = headerColor || '#00a99d';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 cursor-pointer"
        onClick={handleClose}
      />

      {/* Popup wrapper */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 mb-8 sm:mb-0"
        style={{ paddingTop: mascotImage?.url ? '64px' : '0' }}
      >
        {/* Mascot */}
        {mascotImage?.url && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 pointer-events-none z-30">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20 drop-shadow-2xl" style={{ width: 96, height: 96 }}>
              <Image src={mascotImage.url} alt={mascotImage.alt || 'Mascot'} fill className="object-contain" sizes="96px" priority />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="popup-glow-border rounded-3xl overflow-hidden shadow-2xl bg-white">
          {/* Ribbon header */}
          <div
            className="popup-ribbon-wrap overflow-hidden"
            style={{ paddingTop: mascotImage?.url ? '56px' : '0' }}
          >
            <div
              className="popup-ribbon"
              style={{
                background: bgColor,
                // Màu bóng tai gập = tối hơn bgColor 20%
                '--popup-ribbon-shadow': 'color-mix(in srgb, ' + bgColor + ' 70%, black)',
              } as React.CSSProperties}
            >
              <h2 className="text-white font-bold text-base leading-tight tracking-wide drop-shadow-sm">
                {title}
              </h2>
              {subtitle && <p className="text-white/85 text-xs mt-1">{subtitle}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="px-4 pb-5 pt-3 flex flex-col gap-2.5 max-h-[55vh] overflow-y-auto">
            {items.map((item, idx) => {
              const rowContent = (
                <div className="flex items-center gap-3 bg-gray-50 hover:bg-teal-50 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 transition-colors group">
                  <div className="w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm text-2xl">
                    {item.iconImage?.url ? (
                      <Image src={item.iconImage.url} alt={item.iconImage.alt || item.title} width={40} height={40} className="object-contain w-full h-full" />
                    ) : (
                      <span>{item.icon || '🏥'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">{item.title}</p>
                    {item.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>}
                  </div>
                  {item.linkUrl && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  )}
                </div>
              );
              return item.linkUrl ? (
                <Link key={item.id || idx} href={item.linkUrl} onClick={handleClose}>{rowContent}</Link>
              ) : (
                <div key={item.id || idx}>{rowContent}</div>
              );
            })}
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-center mt-5">
          <button onClick={handleClose} aria-label="Đóng popup" className="w-11 h-11 rounded-full bg-white/95 shadow-xl flex items-center justify-center hover:bg-white">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

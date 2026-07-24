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
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const key = storageKey || 'cdc_services_popup_closed';

  useEffect(() => {
    if (showOnce) {
      const closed = localStorage.getItem(key);
      if (closed === 'true') return;
    }
    const delay = (delaySeconds ?? 1) * 1000;
    const timer = setTimeout(() => {
      setShouldRender(true);
      setTimeout(() => setIsOpen(true), 10);
    }, delay);
    return () => clearTimeout(timer);
  }, [delaySeconds, showOnce, key]);

  const handleClose = () => {
    setIsOpen(false);
    if (showOnce) localStorage.setItem(key, 'true');
    setTimeout(() => setShouldRender(false), 350);
  };

  if (!shouldRender) return null;

  const bgColor = headerColor || '#00a99d';

  return (
    <>
      {/* Sparkle keyframes injected inline */}
      <style>{`
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-6px) scale(1.2); opacity: 0.7; }
        }
        @keyframes sparkle-float2 {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.9; }
          50% { transform: translateY(-8px) rotate(20deg) scale(1.3); opacity: 0.5; }
        }
        @keyframes popup-in {
          0% { opacity: 0; transform: scale(0.9) translateY(24px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .sparkle { animation: sparkle-float 2s ease-in-out infinite; }
        .sparkle2 { animation: sparkle-float2 2.4s ease-in-out infinite; }
        .sparkle3 { animation: sparkle-float 1.8s ease-in-out infinite 0.4s; }
        .popup-anim { animation: popup-in 0.35s cubic-bezier(.22,1,.36,1) both; }
        .popup-overlay-enter { animation: fade-in 0.25s ease both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer popup-overlay-enter"
          onClick={handleClose}
        />

        {/* Popup wrapper */}
        <div
          className={`relative z-10 w-full max-w-sm mx-4 mb-8 sm:mb-0 ${isOpen ? 'popup-anim' : ''}`}
          style={{ paddingTop: mascotImage?.url ? '64px' : '0' }}
        >
          {/* Sparkle stars around mascot */}
          {mascotImage?.url && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 pointer-events-none z-30">
              {/* Star top-left */}
              <span className="sparkle absolute top-2 left-4 text-yellow-300 text-lg" style={{ filter: 'drop-shadow(0 0 4px #facc15)' }}>★</span>
              {/* Star top-center */}
              <span className="sparkle2 absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-200 text-base" style={{ filter: 'drop-shadow(0 0 4px #fde68a)' }}>✦</span>
              {/* Star top-right */}
              <span className="sparkle3 absolute top-1 right-4 text-yellow-300 text-xl" style={{ filter: 'drop-shadow(0 0 4px #facc15)' }}>★</span>
              {/* Small dot left */}
              <span className="sparkle absolute top-10 left-1 text-yellow-200 text-sm" style={{ filter: 'drop-shadow(0 0 3px #fde68a)' }}>✦</span>
              {/* Small dot right */}
              <span className="sparkle2 absolute top-8 right-1 text-yellow-300 text-sm" style={{ filter: 'drop-shadow(0 0 3px #facc15)' }}>✦</span>

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
    </>
  );
}

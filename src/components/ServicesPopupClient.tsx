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
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 cursor-pointer" onClick={handleClose} />

      {/* Popup wrapper — wider: max-w-md */}
      <div className="relative z-10 w-full max-w-md mb-8 sm:mb-0">

        {/* ── CAPSULE BADGE nổi phía trên ─────────────────────
            Mascot (nếu có) + Capsule title badge
        ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center" style={{ marginBottom: '-28px', position: 'relative', zIndex: 20 }}>

          {/* Mascot — thò ra từ trên xuống */}
          {mascotImage?.url && (
            <div
              className="mascot-peek"
              style={{
                width: 96,
                height: 96,
                position: 'relative',
                marginBottom: '8px',
                opacity: 0,           /* chống FOUC: ẩn ngay từ đầu, animation sẽ override */
                willChange: 'transform, opacity', /* pre-promote GPU layer */
              }}
            >
              <Image src={mascotImage.url} alt={mascotImage.alt || 'Mascot'} fill className="object-contain" sizes="96px" priority />
            </div>
          )}

          {/* Capsule title */}
          <div
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, #00c9b8 100%)`,
              borderRadius: '999px',
              padding: '10px 32px',
              boxShadow: `0 4px 20px rgba(0,169,157,0.5), 0 2px 6px rgba(0,0,0,0.15)`,
              border: '2.5px solid rgba(255,255,255,0.6)',
              minWidth: '220px',
              textAlign: 'center',
            }}
          >
            <h2 style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '0.04em',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
              margin: 0,
              lineHeight: 1.3,
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '11px', marginTop: '2px', marginBottom: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ── CARD — nền xanh nhẹ ─────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(160deg, #e8f8f7 0%, #f0fbfa 60%, #ffffff 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            border: `1.5px solid rgba(0,169,157,0.15)`,
          }}
        >
          {/* Padding top để nhường chỗ cho capsule nổi xuống */}
          <div className="px-5 pb-5" style={{ paddingTop: '32px' }}>
            <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
              {items.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">Chưa có dịch vụ nào.</p>
              )}
              {items.map((item, idx) => {
                const rowContent = (
                  <div
                    className="flex items-center gap-3 group"
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      boxShadow: '0 1px 4px rgba(0,169,157,0.08)',
                      border: '1px solid rgba(0,169,157,0.12)',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, rgba(0,169,157,0.12) 0%, rgba(0,201,184,0.08) 100%)`,
                        fontSize: '22px',
                      }}
                    >
                      {item.iconImage?.url ? (
                        <Image src={item.iconImage.url} alt={item.iconImage.alt || item.title} width={36} height={36} className="object-contain" />
                      ) : (
                        <span>{item.icon || '🏥'}</span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">{item.title}</p>
                      {item.description && (
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    {/* Arrow */}
                    {item.linkUrl && (
                      <div
                        style={{
                          width: 28, height: 28,
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: bgColor,
                          flexShrink: 0,
                        }}
                      >
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
        </div>

        {/* Close button */}
        <div className="flex justify-center mt-5">
          <button
            onClick={handleClose}
            aria-label="Đóng popup"
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

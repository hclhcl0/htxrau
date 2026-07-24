'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';

// Resolve URL ảnh từ Payload CMS (có thể là relative path)
function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Relative path — ghép với NEXT_PUBLIC_SERVER_URL hoặc origin
  const base = process.env.NEXT_PUBLIC_SERVER_URL || '';
  return `${base}${url}`;
}

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

        {/* ── CARD + MASCOT ──────────────────────────────────
            Card có overflow visible ở trên để mascot nhô lên
            Mascot tuyệt đối ở góc trái-trên, trượt từ dưới lên
        ─────────────────────────────────────────────────── */}
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
                className="mascot-glow"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Capsule badge — vẫn căn giữa phía trên card */}
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
              padding: '9px 28px 9px 56px', /* padding-left lớn hơn nhường chỗ mascot */
              boxShadow: `0 4px 20px rgba(0,169,157,0.45), 0 2px 6px rgba(0,0,0,0.12)`,
              border: '2.5px solid rgba(255,255,255,0.6)',
              minWidth: '200px',
              textAlign: 'center',
            }}>
              <h2 style={{
                color: '#fff', fontWeight: 800, fontSize: '14px',
                letterSpacing: '0.04em', textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                margin: 0, lineHeight: 1.3,
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

          {/* ── CARD TRẮNG ─────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(160deg, #e8f8f7 0%, #f0fbfa 60%, #ffffff 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            border: '1.5px solid rgba(0,169,157,0.15)',
          }}>
            <div className="px-5 pb-5" style={{ paddingTop: '32px' }}>
              <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
                {items.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-6">Chưa có dịch vụ nào.</p>
                )}
                {items.map((item, idx) => {
                  const rowContent = (
                    <div className="flex items-center gap-3 group" style={{
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: '14px', padding: '10px 14px',
                      boxShadow: '0 1px 4px rgba(0,169,157,0.08)',
                      border: '1px solid rgba(0,169,157,0.12)',
                    }}>
                      <div style={{
                        width: 44, height: 44, flexShrink: 0,
                        borderRadius: '12px', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(0,169,157,0.12) 0%, rgba(0,201,184,0.08) 100%)',
                        fontSize: '22px',
                      }}>
                        {item.iconImage?.url ? (
                          <Image src={item.iconImage.url} alt={item.iconImage.alt || item.title} width={36} height={36} className="object-contain" />
                        ) : (
                          <span>{item.icon || '🏥'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">{item.title}</p>
                        {item.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>}
                      </div>
                      {item.linkUrl && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor, flexShrink: 0 }}>
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

'use client';

import React, { useState } from 'react';
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '';

function getImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === 'string' || typeof img === 'number') return null;
  const url = img.url || img.sizes?.thumbnail?.url || null;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
  return `${SERVER_URL}${url}`;
}

// ==================== SLIDER / CAROUSEL ====================
function GallerySlider({ images }: { images: any[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  const activeImg = images[active];
  const activeUrl = getImageUrl(activeImg)!;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* ── Ảnh chính ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: '#000',
          cursor: 'zoom-in',
          overflow: 'hidden',
        }}
        onClick={() => setLightbox(true)}
      >
        <Image
          key={activeUrl}
          src={activeUrl}
          alt={activeImg?.alt || activeImg?.filename || `Ảnh ${active + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority={active === 0}
        />
        {/* Số thứ tự */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 12,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 13,
          }}
        >
          {active + 1} / {images.length}
        </div>

        {/* Nút prev/next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '8px 0 4px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {images.map((img: any, i: number) => {
            const url = getImageUrl(img)!;
            const isActive = i === active;
            return (
              <button
                key={img.id || i}
                onClick={() => setActive(i)}
                style={{
                  flexShrink: 0,
                  width: 80,
                  height: 60,
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: isActive ? '2px solid #1565c0' : '2px solid transparent',
                  opacity: isActive ? 1 : 0.6,
                  cursor: 'pointer',
                  padding: 0,
                  background: '#000',
                  scrollSnapAlign: 'start',
                  transition: 'opacity 0.2s, border-color 0.2s',
                }}
              >
                <Image
                  src={url}
                  alt={img.alt || img.filename || `Thumb ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setLightbox(false)}
        >
          <button
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div
            style={{ position: 'relative', maxWidth: '92vw', maxHeight: '90vh', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeUrl}
              alt={activeImg?.alt || `Ảnh ${active + 1}`}
              width={1600}
              height={1000}
              style={{ objectFit: 'contain', maxHeight: '85vh', width: '100%' }}
            />
            <p style={{ color: '#ccc', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
              {active + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== GRID ====================
function GalleryGrid({ images }: { images: any[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((img: any, i: number) => {
          const url = getImageUrl(img)!;
          return (
            <div
              key={img.id || i}
              className="relative aspect-square rounded-md overflow-hidden cursor-pointer border border-gray-200 group"
              onClick={() => setLightbox(i)}
            >
              <Image
                src={url}
                alt={img.alt || img.filename || `Ảnh ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          );
        })}
      </div>

      {lightbox !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setLightbox(null)}
        >
          <button
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div
            style={{ position: 'relative', maxWidth: '92vw', maxHeight: '90vh', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(images[lightbox])!}
              alt={images[lightbox]?.alt || `Ảnh ${lightbox + 1}`}
              width={1600}
              height={1000}
              style={{ objectFit: 'contain', maxHeight: '85vh', width: '100%' }}
            />
            <p style={{ color: '#ccc', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
              {lightbox + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ==================== MAIN ====================
export default function GalleryBlock({ data }: { data: any }) {
  const rawImages: any[] = data.images || [];
  const images = rawImages.filter((img) => getImageUrl(img) !== null);

  if (images.length === 0) return null;

  const isSlider = data.style === 'slider';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gov-primary text-white p-3 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2" />
        <h2 className="font-bold uppercase tracking-wide">
          {data.caption || 'Thư viện ảnh'} ({images.length} ảnh)
        </h2>
      </div>
      <div className="p-4 bg-gray-50">
        {isSlider ? <GallerySlider images={images} /> : <GalleryGrid images={images} />}
      </div>
    </div>
  );
}

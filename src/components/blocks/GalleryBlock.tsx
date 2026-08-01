'use client';

import React, { useState } from 'react';
import { ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '';

function getImageUrl(img: any): string | null {
  if (!img) return null;
  // upload field hasMany trả về object media hoặc id
  if (typeof img === 'string' || typeof img === 'number') return null; // chỉ là id, chưa populated
  const url = img.url || img.sizes?.thumbnail?.url || null;
  if (!url) return null;
  // Nếu url đã là full URL thì dùng luôn, ngược lại ghép SERVER_URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
  return `${SERVER_URL}${url}`;
}

export default function GalleryBlock({ data }: { data: any }) {
  const rawImages: any[] = data.images || [];
  // Lọc ra chỉ những ảnh đã populated (có url)
  const images = rawImages.filter((img) => getImageUrl(img) !== null);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));

  const isSlider = data.style === 'slider';

  if (images.length === 0) {
    return null; // Không hiển thị nếu không có ảnh hợp lệ
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gov-primary text-white p-3 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2" />
        <h2 className="font-bold uppercase tracking-wide">
          {data.caption || 'Thư viện ảnh'} ({images.length} ảnh)
        </h2>
      </div>
      <div className="p-4 bg-gray-50">
        <div
          className={
            isSlider
              ? 'flex gap-2 overflow-x-auto pb-2 snap-x'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
          }
        >
          {images.map((img: any, i: number) => {
            const url = getImageUrl(img)!;
            return (
              <div
                key={img.id || i}
                className={`relative rounded-md overflow-hidden group cursor-pointer border border-gray-200 ${
                  isSlider ? 'flex-shrink-0 w-48 h-48 snap-start' : 'aspect-square'
                }`}
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={url}
                  alt={img.alt || img.filename || `Ảnh ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(images[lightboxIndex])!}
              alt={images[lightboxIndex]?.alt || `Ảnh ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full max-h-[85vh] rounded-lg"
            />
            <p className="text-white text-center mt-2 text-sm opacity-70">
              {lightboxIndex + 1} / {images.length}
              {images[lightboxIndex]?.alt ? ` — ${images[lightboxIndex].alt}` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useField } from '@payloadcms/ui';

export function GalleryImagePreview({ path }: { path: string }) {
  const { value } = useField<any[]>({ path });
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    if (!value?.length) {
      setImages([]);
      return;
    }
    const ids = value
      .map((v: any) => (typeof v === 'object' ? v.id : v))
      .filter(Boolean)
      .join(',');
    if (!ids) return;

    fetch(`/api/media?where[id][in]=${ids}&limit=100&depth=0`)
      .then((r) => r.json())
      .then((data) => setImages(data.docs || []))
      .catch(() => {});
  }, [JSON.stringify(value)]);

  if (!images.length) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontStyle: 'italic' }}>
        Xem trước ({images.length} ảnh đã chọn):
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
          gap: '6px',
        }}
      >
        {images.map((img: any) => (
          <div
            key={img.id}
            title={img.filename}
            style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: '6px', border: '1px solid #e0e0e0' }}
          >
            <img
              src={img.sizes?.thumbnail?.url || img.url}
              alt={img.alt || img.filename}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

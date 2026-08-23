import React from 'react';
import { getMediaUrl } from '@/lib/mediaUrl';

export function CategoryCover({ category }: { category: any }) {
  if (!category) return null;
  const coverUrl = getMediaUrl(category.coverImage, '');
  
  if (!coverUrl) return null;

  return (
    <div className="w-full h-[200px] md:h-[300px] relative flex-shrink-0 rounded-2xl overflow-hidden shadow-sm mb-6">
      <img src={coverUrl} alt={category.name} className="w-full h-full object-cover" />
    </div>
  );
}

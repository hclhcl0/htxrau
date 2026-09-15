import React from 'react';
import { getMediaUrl } from '@/lib/mediaUrl';

export function UploadBlock({ node, fallbackAlt }: { node: any; fallbackAlt?: string }) {
  if (!node?.value) return null;

  const imgUrl = getMediaUrl(node.value, '');
  const altText = (typeof node.value === 'object' ? (node.value.alt || fallbackAlt) : fallbackAlt) || "Hình ảnh minh họa";

  if (imgUrl) {
    return (
      <span className="block my-6 w-full flex justify-center not-prose">
        <img 
          src={imgUrl} 
          alt={altText} 
          className="rounded-2xl shadow-sm border border-emerald-100 max-w-full h-auto mx-auto block" 
        />
      </span>
    );
  }

  return null;
}

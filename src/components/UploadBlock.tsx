import React from 'react';

export function UploadBlock({ node, fallbackAlt }: { node: any; fallbackAlt?: string }) {
  if (!node?.value) return null;

  // If node.value is an object with url
  const imgUrl = typeof node.value === 'object' ? node.value.url : (typeof node.value === 'string' && (node.value.startsWith('http') || node.value.startsWith('/')) ? node.value : null);
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

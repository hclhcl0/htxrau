'use client';

import React, { useState } from 'react';
import { getMediaUrl } from '@/lib/mediaUrl';

export function InfographicClientBlock({ image, caption }: { image: any; caption?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const imgUrl = getMediaUrl(image, '');
  if (!imgUrl) return null;

  return (
    <>
      <div className="my-8 max-w-3xl mx-auto border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative group bg-white not-prose">
        {/* Preview Container with fixed height and fade out */}
        <div className="relative h-[600px] overflow-hidden w-full cursor-pointer" onClick={() => setIsOpen(true)}>
          <img src={imgUrl} alt={caption || (typeof image === 'object' ? image.alt : '') || 'Infographic'} className="w-full h-auto object-top" />
          
          {/* Fade effect at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          
          {/* Expand Button overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gov-primary hover:bg-gov-secondary text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
            <span>🔍</span> Bấm để xem toàn bộ (Phóng to)
          </div>
        </div>
        {caption && <div className="p-4 bg-gray-50 text-center text-sm text-gray-600 font-medium border-t border-gray-100">{caption}</div>}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col overflow-hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute top-4 right-4 z-10 flex gap-4">
             <a 
               href={imgUrl} 
               download 
               target="_blank"
               onClick={(e) => e.stopPropagation()}
               className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors backdrop-blur-md"
               title="Tải xuống"
             >
               ⬇
             </a>
             <button 
               className="bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors backdrop-blur-md"
             >
               ✕
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
            <div className="max-w-4xl w-full mx-auto" onClick={(e) => e.stopPropagation()}>
               <img src={imgUrl} alt={caption || (typeof image === 'object' ? image.alt : '') || 'Infographic'} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

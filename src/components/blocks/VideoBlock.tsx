"use client";

import React, { useState } from 'react';
import { PlayCircle, X } from 'lucide-react';
import Image from 'next/image';

export default function VideoBlock({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);

  // Lấy ID Youtube từ URL (Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ -> dQw4w9WgXcQ)
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoUrl = data.videoUrl || data.youtubeUrl;
  const videoId = videoUrl ? getYoutubeId(videoUrl) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <>
      <div className={`rounded-xl shadow-sm overflow-hidden my-4 ${data.title ? 'bg-white border border-gray-100' : 'bg-transparent'}`}>
        {data.title && (
          <div className="bg-gov-primary text-white p-3 flex items-center">
            <PlayCircle className="w-5 h-5 mr-2" />
            <h2 className="font-bold uppercase tracking-wide">{data.title}</h2>
          </div>
        )}
        
        {videoId ? (
          <div 
            className="relative aspect-video cursor-pointer group bg-black"
            onClick={() => setIsOpen(true)}
          >
            <Image 
              src={thumbnailUrl!} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              width={640}
              height={360}
              loading="lazy"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 text-gov-primary rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <PlayCircle className="w-10 h-10" />
              </div>
            </div>
          </div>
        ) : data.platform === 'custom' && data.embedCode ? (
          <div className="relative aspect-video w-full bg-black">
            <div dangerouslySetInnerHTML={{ __html: data.embedCode }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
          </div>
        ) : (
          <div className="p-4 bg-gray-100 aspect-video flex items-center justify-center text-gray-500">
            Link Video không hợp lệ
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {isOpen && videoId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                className="w-full h-full absolute inset-0"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

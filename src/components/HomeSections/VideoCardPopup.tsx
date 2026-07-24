"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';

function getYoutubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]+)/);
  return match ? match[1] : null;
}

const TikTokVideoEmbed = ({ videoUrl, tId }: { videoUrl: string, tId: string }) => {
  return (
    <iframe
      className="w-full"
      src={`https://www.tiktok.com/player/v1/${tId}?music_info=1&description=1`}
      title="TikTok video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      style={{ aspectRatio: '9/16', minHeight: '500px' }}
    ></iframe>
  );
};

function getTiktokId(url: string) {
  if (!url) return null;
  const match = url.match(/tiktok\.com\/.*video\/(\d+)/);
  if (match) return match[1];
  return null;
}

export function VideoCardPopup({ 
  video, 
  videoList = [], 
  initialIndex = -1,
  isFeatured = false, 
  variant = 'horizontal' 
}: { 
  video: any, 
  videoList?: any[],
  initialIndex?: number,
  isFeatured?: boolean, 
  variant?: 'vertical' | 'horizontal' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => {
    setActiveIndex(initialIndex);
    setIsOpen(true);
  };

  const navigateVideo = (direction: number) => {
    setActiveIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = videoList.length - 1;
      if (next >= videoList.length) next = 0;
      return next;
    });
  };

  // Card values
  const yId = getYoutubeId(video.videoUrl);
  const tId = getTiktokId(video.videoUrl);
  const thumbUrl = video.thumbnail?.url || (yId ? `https://img.youtube.com/vi/${yId}/${variant === 'vertical' ? 'mqdefault' : 'maxresdefault'}.jpg` : '');

  // Modal values
  const activeVideo = (videoList.length > 0 && activeIndex >= 0) ? videoList[activeIndex] : video;
  const modalYId = getYoutubeId(activeVideo.videoUrl);
  const modalTId = getTiktokId(activeVideo.videoUrl);

  return (
    <>
      <div
        onClick={openModal}
        className={`group cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full h-full flex flex-col relative ${variant === 'vertical' ? 'rounded-xl border-none bg-transparent' : 'bg-white rounded-xl border border-gray-100'}`}
      >
        <div className={`relative flex items-center justify-center shrink-0 w-full ${variant === 'vertical' ? 'h-full absolute inset-0' : 'aspect-video overflow-hidden bg-gray-100'}`}>
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={video.title || 'Video CDC Đà Nẵng'}
              className="w-full h-full object-cover scale-[1.05] group-hover:scale-110 transition-transform duration-300"
              width={variant === 'vertical' ? 300 : 480}
              height={variant === 'vertical' ? 533 : 270}
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400">Không có ảnh thu nhỏ</span>
          )}
          
          {/* Vertical Title Gradient Overlay */}
          {variant === 'vertical' && (
             <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black via-black/70 to-transparent opacity-95 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
          )}

          {/* Play button overlay */}
          {variant === 'vertical' ? (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 pointer-events-none drop-shadow-md">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-6 sm:h-6">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.7 6.3L15.3 3.7C15.7 3.3 16.3 3.3 16.7 3.7C17.1 4.1 17.1 4.7 16.7 5.1L14.8 7H18C20.2 7 22 8.8 22 11V17C22 19.2 20.2 21 18 21H6C3.8 21 2 19.2 2 17V11C2 8.8 3.8 7 6 7H9.2L7.3 5.1C6.9 4.7 6.9 4.1 7.3 3.7C7.7 3.3 8.3 3.3 8.7 3.7L11.3 6.3C11.5 6.5 11.7 6.6 12 6.6C12.3 6.6 12.5 6.5 12.7 6.3ZM10.5 11.5L14.5 14L10.5 16.5V11.5Z" />
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-slate-900/50 transition-all duration-300 z-20">
              <div className={`rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 border border-white/30 ${isFeatured ? 'w-20 h-20' : 'w-14 h-14'}`}>
                <svg viewBox="0 0 24 24" fill="white" className={`${isFeatured ? 'w-8 h-8 ml-1.5' : 'w-6 h-6 ml-1'} drop-shadow-md`}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className={variant === 'vertical' ? 'absolute inset-x-0 bottom-0 z-20 p-2 sm:p-3 flex flex-col gap-0.5' : `relative z-20 ${isFeatured ? "p-4 flex flex-col gap-2" : "p-3 flex-1 flex flex-col gap-1"}`}>
          <h4 className={`${variant === 'vertical' ? 'font-bold text-white text-[11px] sm:text-[13px] group-hover:text-blue-300 drop-shadow-md' : (isFeatured ? 'font-bold text-lg' : 'text-sm font-semibold')} line-clamp-2 transition-colors leading-tight ${variant !== 'vertical' && 'text-gray-800 group-hover:text-[var(--primary)]'}`}>
            {video.title}
          </h4>
          
          {variant === 'vertical' ? (
             <p className="text-white text-[10.5px] sm:text-[11.5px] line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-tight mt-0.5">
               {video.description || new Date(video.publishedDate).toLocaleDateString('vi-VN')}
             </p>
          ) : (
             <>
               {video.description && (
                 <p className={`text-gray-600 line-clamp-2 ${isFeatured ? 'text-sm' : 'text-xs'}`}>
                   {video.description}
                 </p>
               )}
               {video.publishedDate && (
                 <p suppressHydrationWarning className="text-xs text-gray-400 mt-auto pt-1">
                   {new Date(video.publishedDate).toLocaleDateString('vi-VN')}
                 </p>
               )}
             </>
          )}
        </div>
      </div>

      {mounted && isOpen && modalYId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          {videoList.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }}
                aria-label="Video trước"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(1); }}
                aria-label="Video tiếp theo"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-5xl bg-black rounded-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-black text-white p-3 flex justify-between items-center">
              <h3 className="font-medium truncate pr-8">{activeVideo.title || 'YouTube Video'}</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full aspect-video">
              <iframe
                className="w-full h-full absolute inset-0"
                src={`https://www.youtube.com/embed/${modalYId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>,
        document.body
      )}

      {mounted && isOpen && modalTId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          {videoList.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }}
                aria-label="Video trước"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(1); }}
                aria-label="Video tiếp theo"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-[400px] rounded-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-0 right-0 z-20 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors cursor-pointer m-2"
            >
              <X className="w-6 h-6" />
            </button>
            <TikTokVideoEmbed videoUrl={activeVideo.videoUrl} tId={modalTId} />
          </div>
        </div>,
        document.body
      )}
      
      {mounted && isOpen && !modalYId && !modalTId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)}></div>
          {videoList.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }}
                aria-label="Video trước"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-black/50 hover:bg-black text-white rounded-full p-2 md:p-3 transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigateVideo(1); }}
                aria-label="Video tiếp theo"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative bg-white p-6 rounded-lg z-10 max-w-md w-full text-center">
            <p className="text-gray-800 mb-4">Video này cần được mở ở trang gốc.</p>
            <a href={activeVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-medium inline-block">
              Mở video
            </a>
            <button onClick={() => setIsOpen(false)} className="ml-3 text-gray-500 hover:text-gray-800 font-medium">Đóng</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, BellOff, Bell } from 'lucide-react';

const STORAGE_KEY = 'warning_section_visible';

interface Props {
  title: string;
  icon: React.ReactNode;
  bannerContent: React.ReactNode;
  warningContent: React.ReactNode;
}

export const WarningToggleWrapper = ({ title, icon, bannerContent, warningContent }: Props) => {
  // Mặc định hiện, lấy từ localStorage nếu có
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsVisible(stored === 'true');
    }
  }, []);

  const toggle = () => {
    const next = !isVisible;
    setIsVisible(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  // Tránh hydration mismatch: render như mặc định (visible) trước khi mounted
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-3">
        <div className="aspect-[2/1] md:aspect-[2.5/1] h-auto w-full rounded-xl overflow-hidden lg:col-span-7 xl:col-span-7">
          {bannerContent}
        </div>
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col bg-transparent overflow-hidden h-auto">
          <ColumnContent title={title} icon={icon} isVisible={true} onToggle={() => {}} />
          <div className="p-0 flex-1 h-auto lg:h-full w-full flex flex-col min-h-0">
             {warningContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-3 relative">
      {/* Cột trái: Slider Banner chính - sẽ phóng to nếu cảnh báo bị ẩn */}
      <div className={`aspect-[2/1] md:aspect-[2.5/1] h-auto w-full rounded-xl overflow-hidden transition-all duration-300 ${isVisible ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-10 xl:col-span-10'}`}>
        {bannerContent}
      </div>

      {/* Cột phải: hiện khi isVisible */}
      {isVisible && (
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col bg-transparent overflow-hidden h-auto">
          <ColumnContent title={title} icon={icon} isVisible={isVisible} onToggle={toggle} />
          <div className="p-0 flex-1 h-auto lg:h-full w-full flex flex-col min-h-0">
            {warningContent}
          </div>
        </div>
      )}

      {/* Nút mở lại khi đã ẩn — đặt nổi ở góc phải trên của banner */}
      {!isVisible && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggle}
            title="Hiện cảnh báo quan trọng"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-none bg-white/80 backdrop-blur hover:bg-white text-orange-600 transition-all shadow-md hover:scale-105"
          >
            <Bell size={16} className="animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
              Cảnh báo
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// ── Header của cột (tiêu đề + nút tắt) ──
function ColumnContent({
  title,
  icon,
  isVisible,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-0 py-1.5 flex items-center gap-1.5 mb-1 flex-shrink-0 justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-orange-600 uppercase tracking-tight text-[13px]">
          {title}
        </h3>
      </div>

      {/* Nút ẩn */}
      <button
        onClick={onToggle}
        title="Ẩn cảnh báo quan trọng"
        className="flex items-center gap-0.5 text-[10px] text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-md px-1.5 py-0.5 transition-all border border-transparent hover:border-orange-200"
      >
        <BellOff size={11} />
        <span className="hidden sm:inline">Ẩn</span>
      </button>
    </div>
  );
}

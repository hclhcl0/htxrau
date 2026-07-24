'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, BellOff, Bell } from 'lucide-react';

const STORAGE_KEY = 'warning_section_visible';

interface Props {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const WarningToggleWrapper = ({ title, icon, children }: Props) => {
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
      <div className="lg:col-span-3 xl:col-span-3 flex flex-col bg-transparent overflow-hidden h-auto">
        <ColumnContent title={title} icon={icon} isVisible={true} onToggle={() => {}} />
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Cột phải: hiện khi isVisible */}
      {isVisible && (
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col bg-transparent overflow-hidden h-auto">
          <ColumnContent title={title} icon={icon} isVisible={isVisible} onToggle={toggle} />
          <div className="p-0 flex-1 h-auto lg:h-full w-full flex flex-col min-h-0">
            {children}
          </div>
        </div>
      )}

      {/* Nút mở lại khi đã ẩn — tab nhỏ bên phải slider */}
      {!isVisible && (
        <div className="lg:col-span-3 xl:col-span-3 flex items-start justify-start">
          <button
            onClick={toggle}
            title="Hiện cảnh báo quan trọng"
            className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all group shadow-sm"
          >
            <Bell size={16} className="group-hover:animate-bounce" />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Cảnh báo
            </span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
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

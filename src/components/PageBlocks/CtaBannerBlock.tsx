import React from 'react';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/mediaUrl';

interface Button {
  label?: string;
  url?: string;
  openInNewTab?: boolean;
}

interface Props {
  title: string;
  description?: string;
  style?: 'primary' | 'gradient' | 'dark' | 'light' | 'image';
  backgroundImage?: any;
  primaryButton?: Button;
  secondaryButton?: Button;
}

export function CtaBannerBlock({
  title,
  description,
  style = 'primary',
  backgroundImage,
  primaryButton,
  secondaryButton,
}: Props) {
  const bgStyles: Record<string, string> = {
    primary: 'bg-[var(--primary)]',
    gradient: 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]',
    dark: 'bg-gray-900',
    light: 'bg-gray-50 border border-gray-200',
    image: 'relative overflow-hidden',
  };

  const textColor = style === 'light' ? 'text-gray-900' : 'text-white';
  const subTextColor = style === 'light' ? 'text-gray-600' : 'text-white/80';
  const bgImgUrl = getMediaUrl(backgroundImage, '');

  return (
    <div className={`my-8 rounded-2xl ${bgStyles[style]} ${textColor}`}>
      {style === 'image' && bgImgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center rounded-2xl"
          style={{ backgroundImage: `url(${bgImgUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60 rounded-2xl" />
        </div>
      )}

      <div className="relative z-10 px-8 py-12 text-center">
        <h2 className={`text-2xl md:text-3xl font-black mb-3 leading-tight ${textColor}`}>
          {title}
        </h2>
        {description && (
          <p className={`text-base md:text-lg mb-8 max-w-2xl mx-auto ${subTextColor}`}>
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {primaryButton?.label && primaryButton.url && (
            <Link
              href={primaryButton.url}
              target={primaryButton.openInNewTab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-base transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                style === 'light'
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  : 'bg-white text-[var(--primary)] hover:bg-gray-100'
              }`}
            >
              {primaryButton.label}
            </Link>
          )}
          {secondaryButton?.label && secondaryButton.url && (
            <Link
              href={secondaryButton.url}
              target={secondaryButton.openInNewTab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-base border-2 transition-all hover:-translate-y-0.5 ${
                style === 'light'
                  ? 'border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-[var(--primary)]'
              }`}
            >
              {secondaryButton.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

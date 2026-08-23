import { getMediaUrl } from '@/lib/mediaUrl';

interface BannerSectionProps {
  image: { url?: string; alt?: string; filename?: string };
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  openInNewTab?: boolean;
  style?: 'fullwidth' | 'card';
}

export function BannerSection({ image, title, subtitle, linkUrl, openInNewTab, style = 'fullwidth' }: BannerSectionProps) {
  const imageUrl = getMediaUrl(image, '');
  if (!imageUrl) return null;

  const content = (
    <div className={`relative overflow-hidden ${style === 'card' ? 'rounded-2xl shadow-lg' : ''} w-full`}>
      <img
        src={imageUrl}
        alt={title || image?.alt || ''}
        className="w-full h-auto object-cover block"
        style={{ maxHeight: style === 'fullwidth' ? '400px' : '280px', objectFit: 'cover', width: '100%' }}
      />
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          {title && (
            <h3 className="text-white font-bold text-xl md:text-2xl mb-1 drop-shadow">{title}</h3>
          )}
          {subtitle && (
            <p className="text-white/90 text-sm md:text-base drop-shadow">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  const wrapperClass = style === 'fullwidth'
    ? 'w-full my-2'
    : 'container mx-auto px-4 max-w-7xl my-6';

  let finalContent = content;
  if (style === 'card') {
    finalContent = (
      <div className="p-1 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
        {content}
      </div>
    );
  }

  if (linkUrl) {
    return (
      <div className={wrapperClass}>
        <a
          href={linkUrl}
          target={openInNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block hover:opacity-95 transition-opacity"
        >
          {finalContent}
        </a>
      </div>
    );
  }

  return <div className={wrapperClass}>{finalContent}</div>;
}

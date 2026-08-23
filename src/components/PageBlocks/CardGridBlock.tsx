import React from 'react';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/mediaUrl';

interface Card {
  id?: string;
  icon?: string;
  image?: any;
  title: string;
  description?: string;
  linkUrl?: string;
  linkLabel?: string;
  highlight?: boolean;
}

interface Props {
  columns?: '2' | '3' | '4';
  cardStyle?: 'shadow' | 'border' | 'filled' | 'minimal';
  cards: Card[];
}

export function CardGridBlock({ columns = '3', cardStyle = 'shadow', cards }: Props) {
  if (!cards?.length) return null;

  const gridClass = {
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const baseCard = 'rounded-xl flex flex-col overflow-hidden transition-all duration-200 h-full';
  const cardStyleClass = {
    shadow: 'bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5',
    border: 'bg-white border-2 border-gray-200 hover:border-[var(--primary)]',
    filled: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]',
    minimal: 'bg-transparent hover:bg-gray-50',
  }[cardStyle];

  return (
    <div className={`grid ${gridClass} gap-5 my-6`}>
      {cards.map((card, i) => {
        const isHighlight = card.highlight;
        const highlightClass = isHighlight
          ? 'ring-2 ring-[var(--primary)] ring-offset-2 shadow-md'
          : '';
        const imgUrl = getMediaUrl(card.image, '');

        return (
          <div key={card.id || i} className={`${baseCard} ${cardStyleClass} ${highlightClass}`}>
            {/* Image */}
            {imgUrl && (
              <div className="aspect-[4/3] w-full overflow-hidden flex-shrink-0">
                <img
                  src={imgUrl}
                  alt={card.image?.alt || card.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Body */}
            <div className="p-5 flex flex-col flex-grow">
              {card.icon && (
                <div className="text-3xl mb-3">{card.icon}</div>
              )}
              <h3 className={`text-lg font-bold mb-2 ${cardStyle === 'filled' ? 'text-white' : 'text-gray-900'}`}>
                {card.title}
              </h3>
              {card.description && (
                <p className={`text-sm flex-grow mb-4 ${cardStyle === 'filled' ? 'text-white/80' : 'text-gray-500'}`}>
                  {card.description}
                </p>
              )}
              {card.linkUrl && (
                <Link
                  href={card.linkUrl}
                  className={`inline-flex items-center gap-1 text-sm font-semibold mt-auto group transition-all ${
                    cardStyle === 'filled'
                      ? 'text-white/90 hover:text-white'
                      : 'text-[var(--primary)] hover:text-[var(--primary-dark)]'
                  }`}
                >
                  {card.linkLabel || 'Xem thêm'}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

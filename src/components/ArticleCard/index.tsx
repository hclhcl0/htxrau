import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, HeartPulse } from 'lucide-react';
import Image from 'next/image';

interface ArticleCardProps {
  article: any;
  featured?: boolean;
}

// Helper: kiểm tra URL nội bộ
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('ecdc.vnos.org');
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const imgUrl = article.image?.url || null;
  const date = new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN');
  const catName = article.category?.name || '';

  if (featured) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow group mb-6 flex flex-col md:flex-row h-full">
        <Link
          href={`/bai-viet/${article.slug || article.id}`}
          className="md:w-1/2 aspect-video md:aspect-auto block overflow-hidden bg-gray-100 flex-shrink-0 relative"
        >
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              unoptimized={!isInternalUrl(imgUrl)}
            />
          ) : (
            <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-teal-50">
              <HeartPulse className="w-16 h-16 text-teal-200" />
            </div>
          )}
        </Link>
        <div className="p-6 flex flex-col justify-center flex-grow">
          {catName && (
            <span className="inline-block text-xs font-bold text-[var(--primary)] bg-blue-50 px-3 py-1 rounded-full mb-3 w-fit">
              {catName}
            </span>
          )}
          <Link href={`/bai-viet/${article.slug || article.id}`}>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-3 mb-3">
              {article.title}
            </h2>
          </Link>
          {article.description && (
            <p className="text-gray-500 text-sm line-clamp-3 mb-4">{article.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mt-auto pt-2">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{date}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{article.views || 0}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <Link href={`/bai-viet/${article.slug || article.id}`} className="block aspect-video bg-gray-100 overflow-hidden relative">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            unoptimized={!isInternalUrl(imgUrl)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-teal-50">
            <HeartPulse className="w-10 h-10 text-teal-200" />
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        {catName && (
          <span className="text-xs font-bold text-[var(--primary)] mb-2 block">{catName}</span>
        )}
        <Link href={`/bai-viet/${article.slug || article.id}`}>
          <h3 className="font-bold text-gray-900 leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-3 text-[15px] mb-2 flex-grow">
            {article.title}
          </h3>
        </Link>
        {article.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mb-2">{article.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mt-auto pt-2">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{date}</span>
          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{article.views || 0}</span>
        </div>
      </div>
    </div>
  );
}

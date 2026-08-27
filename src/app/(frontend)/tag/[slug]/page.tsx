export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/Pagination';
import { getMediaUrl } from '@/lib/mediaUrl';

interface PageParams {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'tags',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (docs.length === 0) return {};
  
  return {
    title: `Từ khóa: ${docs[0].title} | HTX Rau An Toàn Túy Loan`,
  };
}

export default async function TagPage({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  
  const payload = await getPayload({ config: configPromise });
  
  // 1. Lấy thông tin tag
  const { docs: tags } = await payload.find({
    collection: 'tags',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (tags.length === 0) {
    return notFound();
  }

  const tag = tags[0];
  
  // 1.5 Tìm kiếm thông tin menu từ SiteSettings để hiển thị breadcrumb
  let breadcrumbTitle = `Từ khóa: ${tag.title}`;
  let pageTitle = `Chủ đề: ${tag.title}`;
  let parentMenuTitle = '';
  
  try {
    const siteSettings = await payload.findGlobal({ slug: 'site-settings' });
    if (siteSettings?.menu?.menuItems) {
      const targetUrl = `/tag/${slug}`;
      for (const item of siteSettings.menu.menuItems) {
        if (item.url === targetUrl) {
          breadcrumbTitle = item.label;
          pageTitle = item.label;
          break;
        }
        
        if (item.subItems) {
          for (const sub of item.subItems) {
            if (sub.url === targetUrl) {
              parentMenuTitle = item.label;
              breadcrumbTitle = sub.label;
              pageTitle = sub.label;
              break;
            }
          }
        }
        if (breadcrumbTitle !== `Từ khóa: ${tag.title}`) break;
      }
    }
  } catch (error) {
    console.error('Error fetching site settings for breadcrumb', error);
  }

  // 2. Lấy bài viết thuộc tag này (có phân trang)
  const result = await payload.find({
    collection: 'articles',
    where: {
      tags: {
         contains: tag.id,
      }
    },
    sort: '-publishedAt',
    limit: 12,
    page: page,
    depth: 1,
  });

  const { docs: articles, totalPages, page: currentPage, hasPrevPage, hasNextPage } = result;

  return (
    <div className="container mx-auto px-4 pt-2 md:pt-4 pb-6 md:pb-10 max-w-7xl">
      <h1 className="text-xl md:text-2xl font-bold text-gov-primary mb-6 border-b-2 border-gov-secondary pb-2.5 inline-block tracking-wide">
        {pageTitle}
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
          Chưa có bài viết nào liên quan đến từ khóa này.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article: any) => {
              const mediaUrl = getMediaUrl(article.image, '/placeholder-vegetable.svg');
              
              return (
                <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="aspect-video bg-gray-100 w-full relative overflow-hidden">
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      <img src={mediaUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gov-primary transition-colors line-clamp-3 leading-tight">
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium mt-auto">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-1" /> {article.views || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination 
            totalPages={totalPages} 
            currentPage={currentPage || 1} 
            hasPrevPage={hasPrevPage} 
            hasNextPage={hasNextPage} 
          />
        </>
      )}
    </div>
  );
}

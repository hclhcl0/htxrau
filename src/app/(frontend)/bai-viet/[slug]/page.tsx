export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { headers } from 'next/headers';

import { getJsxConverters } from '@/components/LexicalConverters';
import { ArticleReaderTools } from '@/components/ArticleReaderTools';
import type { ReaderToolsConfig } from '@/components/ArticleReaderTools';
import { SidebarRenderer } from '@/components/SidebarRenderer';
import { NewsGrid } from '@/components/NewsGrid';

interface PageParams {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}
export async function generateMetadata({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === 'true';
  const requestHeaders = await headers();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: requestHeaders });
  
  const canPreview = isPreview && user;

  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    draft: canPreview ? true : false,
    overrideAccess: canPreview ? true : false,
  });

  if (docs.length === 0) return {};
  
  return {
    title: `${docs[0].title} | CDC Đà Nẵng`,
  };
}

export default async function ArticlePage({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === 'true';
  const requestHeaders = await headers();

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: requestHeaders });
  
  const canPreview = isPreview && user;

  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
    draft: canPreview ? true : false,
    overrideAccess: canPreview ? true : false,
  });

  if (docs.length === 0) {
    return notFound();
  }

  const article = docs[0];
  const catName = typeof article.category === 'object' && article.category ? (article.category as any).name : 'Tin tức';
  const catSlug = typeof article.category === 'object' && article.category ? (article.category as any).slug : '';
  
  // Fetch latest articles for the sidebar
  const { docs: latestArticles } = await payload.find({
    collection: 'articles',
    sort: '-publishedAt',
    limit: 5,
    where: {
      id: {
        not_equals: article.id,
      }
    }
  });


  // Xác định ID của chuyên mục cha để lấy các chuyên mục cùng nhóm
  let targetParentId = null;

  if (typeof article.category === 'object' && article.category !== null) {
    const cat = article.category as any;
    targetParentId = cat.parent ? (typeof cat.parent === 'object' ? cat.parent.id : cat.parent) : cat.id;
  } else if (article.category) {
    try {
      const catDoc = await payload.findByID({ collection: 'categories', id: article.category });
      targetParentId = catDoc.parent ? (typeof catDoc.parent === 'object' ? catDoc.parent.id : catDoc.parent) : catDoc.id;
    } catch (e) {}
  }

  let categories = [];
  if (targetParentId) {
    const { docs } = await payload.find({
      collection: 'categories',
      limit: 50,
      where: { parent: { equals: targetParentId } }
    });
    categories = docs;

    // Nếu không có chuyên mục con nào cùng nhóm, chỉ hiển thị chính chuyên mục cha đó
    // Tuyệt đối KHÔNG fallback lấy toàn bộ Root categories (Sức khỏe, Dịch vụ)
    if (categories.length === 0) {
      // Tìm các chuyên mục con khác để hiển thị cho đa dạng
      const fallback = await payload.find({
        collection: 'categories',
        limit: 15,
        where: { parent: { exists: true } } // CHỈ lấy chuyên mục con
      });
      if (fallback.docs.length > 0) {
        categories = fallback.docs;
      } else {
        try {
          const selfDoc = await payload.findByID({ collection: 'categories', id: targetParentId });
          categories = [selfDoc];
        } catch (e) {}
      }
    }
  } else {
    // Nếu bài viết không có chuyên mục, fallback hiển thị các chuyên mục con ngẫu nhiên
    const { docs } = await payload.find({
      collection: 'categories',
      limit: 15,
      where: { parent: { exists: true } }
    });
    categories = docs;
  }

  // ── P4: Smart hybrid related articles ────────────────────────────────
  const RELATED_LIMIT = 6;
  const excludeArticleId = article.id;
  const articleCategoryId = typeof article.category === 'object' && article.category
    ? (article.category as any).id
    : article.category;
  const articleTags: string[] = ((article as any).tags || [])
    .map((t: any) => (typeof t === 'object' ? t.id : t))
    .filter(Boolean);
  let relatedArticles: any[] = [];

  // Step 1: Cùng chuyên mục + cùng tag
  if (articleCategoryId && articleTags.length > 0) {
    const { docs } = await payload.find({
      collection: 'articles', limit: RELATED_LIMIT, depth: 1, sort: '-publishedAt',
      where: { and: [
        { id: { not_equals: excludeArticleId } },
        { category: { equals: articleCategoryId } },
        { tags: { in: articleTags } },
      ]},
    });
    relatedArticles = docs;
  }
  // Step 2: Cùng chuyên mục
  if (relatedArticles.length < RELATED_LIMIT && articleCategoryId) {
    const ids = [excludeArticleId, ...relatedArticles.map(d => d.id)];
    const { docs } = await payload.find({
      collection: 'articles', limit: RELATED_LIMIT - relatedArticles.length, depth: 1, sort: '-publishedAt',
      where: { and: [{ id: { not_in: ids } }, { category: { equals: articleCategoryId } }] },
    });
    relatedArticles = [...relatedArticles, ...docs];
  }
  // Step 3: Cùng chuyên mục cha
  if (relatedArticles.length < RELATED_LIMIT && targetParentId && targetParentId !== articleCategoryId) {
    const ids = [excludeArticleId, ...relatedArticles.map(d => d.id)];
    const { docs } = await payload.find({
      collection: 'articles', limit: RELATED_LIMIT - relatedArticles.length, depth: 1, sort: '-publishedAt',
      where: { and: [
        { id: { not_in: ids } },
        { or: [{ category: { equals: targetParentId } }, { additionalCategories: { equals: targetParentId } }] },
      ]},
    });
    relatedArticles = [...relatedArticles, ...docs];
  }
  // Step 4: Bài mới nhất toàn site
  if (relatedArticles.length < RELATED_LIMIT) {
    const ids = [excludeArticleId, ...relatedArticles.map(d => d.id)];
    const { docs } = await payload.find({
      collection: 'articles', limit: RELATED_LIMIT - relatedArticles.length, depth: 1, sort: '-publishedAt',
      where: { id: { not_in: ids } },
    });
    relatedArticles = [...relatedArticles, ...docs];
  }
  // ─────────────────────────────────────────────────────────────────────

  let sidebarWidgets: any[] = [];
  let readerToolsConfig: ReaderToolsConfig = {};
  try {
    const globalSettings = await payload.findGlobal({ slug: 'site-settings', depth: 2 });
    sidebarWidgets = (globalSettings as any).sidebarWidgets || [];
    readerToolsConfig = (globalSettings as any).articleReaderTools || {};
  } catch (err) {
    console.error("Failed to fetch sidebar settings:", err);
  }

  // Thông minh bổ sung các tiện ích mặc định (Chuyên mục, Tin mới) nếu admin chưa thêm
  const hasCategories = sidebarWidgets.some(w => w.blockType === 'categoriesWidget');
  const hasRecent = sidebarWidgets.some(w => w.blockType === 'recentArticlesWidget');
  
  if (!hasCategories) {
    sidebarWidgets.push({
      id: 'default-categories',
      blockType: 'categoriesWidget',
      title: 'Chuyên mục',
      limit: 10
    });
  }
  
  if (!hasRecent) {
    sidebarWidgets.push({
      id: 'default-recent',
      blockType: 'recentArticlesWidget',
      title: 'Tin mới cập nhật',
      limit: 5
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:gap-5">
        
        {/* Main Content Wrapper - relative for sidebar positioning */}
        <div className="relative">
          <article className="relative bg-white rounded-xl shadow-sm border border-gray-100 pt-3 pb-4 md:pt-5 md:pb-8 md:pl-16 overflow-visible min-w-0">
            
            <div className="px-4 md:px-0 md:pr-6 lg:pr-8">
              <div className="flex items-center text-sm text-gray-500 mb-2 md:mb-3 overflow-x-auto whitespace-nowrap pb-1">
                 <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
                 <span className="mx-2 flex-shrink-0">/</span>
                 <Link href={`/${catSlug}`} className="hover:text-gov-primary transition-colors">{catName}</Link>
              </div>
              
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-5 leading-tight break-words">
                 {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 border-b border-gray-100 pb-2 mb-2 md:pb-3 md:mb-4">
                 <span className="flex items-center gap-1.5">
                     <Calendar size={14} className="md:w-4 md:h-4"/>
                     {new Date((article as any).publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                 </span>
                 <span className="flex items-center gap-1.5"><Eye size={14} className="md:w-4 md:h-4"/> {(article as any).views || 0} lượt xem</span>
                 {(article as any).author_name && <span className="flex items-center gap-1.5">Tác giả: <span className="font-medium text-gray-700">{(article as any).author_name}</span></span>}
                 <Link href={`/${catSlug}`} className="bg-gov-secondary/10 text-gov-secondary hover:bg-gov-secondary hover:text-white transition-colors px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium">
                   {catName}
                 </Link>
              </div>

              {/* Mô tả ngắn / Sapo */}
              {(article as any).description && (
                <p className="px-4 md:px-0 md:pr-6 lg:pr-8 text-gray-600 text-base md:text-lg font-medium leading-relaxed border-l-4 border-gov-primary pl-4 mb-4 italic bg-blue-50/50 py-3 rounded-r-lg">
                  {(article as any).description}
                </p>
              )}

              {/* Mobile Reader Tools */}
              <div className="md:hidden mb-4 -mt-1 px-4 md:px-0">
                <ArticleReaderTools mode="tools" toolsConfig={readerToolsConfig} />
              </div>
            </div>

            {/* Main Prose Content */}
            <div className="px-1 md:px-0 md:pr-4 lg:pr-6 flex">
              {/* Desktop Sticky Reader Tools - pinned to the start of prose content */}
              <div className="hidden md:block w-10 shrink-0 -ml-[64px] mr-6 relative">
                <div className="sticky top-32 z-10">
                  <ArticleReaderTools mode="tools" toolsConfig={readerToolsConfig} />
                </div>
              </div>

              <div className="prose prose-base md:prose-lg max-w-none break-words prose-p:!my-1.5 md:prose-p:!my-2 prose-headings:!my-3 md:prose-headings:!my-4 prose-ul:!my-1 prose-li:!my-0.5 prose-img:!my-3 prose-headings:text-gov-primary prose-a:text-gov-secondary hover:prose-a:text-gov-primary prose-img:rounded-xl w-full min-w-0 overflow-hidden">
                 {article.content ? (
                    <RichText data={article.content} converters={getJsxConverters(`Hình ảnh minh họa cho bài viết: ${article.title}`)} />
                 ) : (
                    <p>Nội dung đang cập nhật...</p>
                 )}
              </div>
            </div>
          </article>
          
          <div className="mt-8">
            <NewsGrid
              categoryName="Bài viết liên quan"
              limitOverride={RELATED_LIMIT}
              layoutOverride="list-small"
              disableContainer={true}
              preloadedArticles={relatedArticles}
            />
          </div>
        </div>

        {/* Sidebar */}
        <SidebarRenderer
          widgets={sidebarWidgets}
          latestArticles={latestArticles}
          categories={categories}
        />
      </div>
    </div>
  );
}

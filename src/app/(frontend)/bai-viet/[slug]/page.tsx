import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Calendar, Eye, Sprout } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { headers } from 'next/headers';

import { getJsxConverters } from '@/components/LexicalConverters';
import { ArticleReaderTools } from '@/components/ArticleReaderTools';
import type { ReaderToolsConfig } from '@/components/ArticleReaderTools';
import { SidebarRenderer } from '@/components/SidebarRenderer';
import { NewsGrid } from '@/components/NewsGrid';
import { ArticleViewTracker } from '@/components/ArticleViewTracker';
import { getMediaUrl } from '@/lib/mediaUrl';

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
    title: `${docs[0].title} | HTX Rau An Toàn Túy Loan`,
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
        { category: { equals: targetParentId } },
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
            <ArticleViewTracker slug={article.slug} />
            
            <div className="px-4 md:px-0 md:pr-6 lg:pr-8">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                 <div className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
                    <Link href="/" className="hover:text-emerald-700 transition-colors">Trang chủ</Link>
                    <span className="mx-2 flex-shrink-0">/</span>
                    <Link href={`/${catSlug || 'bai-viet'}`} className="hover:text-emerald-700 transition-colors">{catName}</Link>
                 </div>
                 {user && (
                   <Link href={`/admin/collections/articles/${article.id}`} target="_blank" className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs md:text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm ml-3">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                     Sửa bài
                   </Link>
                 )}
              </div>
              
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-3 md:mb-5 leading-tight break-words">
                 {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 border-b border-gray-100 pb-2 mb-2 md:pb-3 md:mb-4">
                 <span className="flex items-center gap-1.5">
                     <Calendar size={14} className="md:w-4 md:h-4 text-emerald-600"/>
                     {new Date((article as any).publishedAt || article.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(',', '')}
                 </span>
                 <span className="flex items-center gap-1.5"><Eye size={14} className="md:w-4 md:h-4 text-emerald-600"/> {(article as any).views || 0} lượt xem</span>
                 {(article as any).author_name && <span className="flex items-center gap-1.5">Tác giả: <span className="font-semibold text-emerald-900">{(article as any).author_name}</span></span>}
                 <Link href={`/${catSlug || 'bai-viet'}`} className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                   {catName}
                 </Link>
              </div>

              {/* Mobile Reader Tools (ABOVE Sapo) */}
              <div className="md:hidden mt-2 mb-4 px-4 md:px-0 border-t border-gray-100 pt-4">
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

              <div className="prose prose-base md:prose-lg max-w-none break-words prose-p:!my-2 md:prose-p:!my-3 prose-headings:!my-4 md:prose-headings:!my-5 prose-ul:!my-2 prose-li:!my-1 prose-img:!my-4 prose-headings:text-emerald-900 prose-a:text-emerald-700 hover:prose-a:text-emerald-900 prose-img:rounded-2xl w-full min-w-0 overflow-hidden">
                 {/* Ảnh Thumbnail / Bìa chính của bài viết */}
                 {(() => {
                   const featuredImgUrl = ((article as any).image && !(article as any).image?.url?.includes('logo.webp'))
                     ? getMediaUrl((article as any).image, (article.slug ? `/images/articles/${article.slug}.svg` : null))
                     : (article.slug ? `/images/articles/${article.slug}.svg` : null);
                   
                   return featuredImgUrl ? (
                     <div className="relative w-full aspect-[16/9] md:aspect-[21/10] rounded-2xl overflow-hidden mb-6 shadow-md border border-emerald-100 bg-emerald-50/60">
                       <Image
                         src={featuredImgUrl}
                         alt={(article as any).image?.alt || article.title}
                         fill
                         sizes="(max-width: 1200px) 100vw, 1000px"
                         className="object-cover"
                         priority
                       />
                     </div>
                   ) : null;
                 })()}

                 {/* Mô tả ngắn / Sapo */}
                 {(article as any).description && (
                   <p className="text-gray-800 text-[15px] md:text-[17px] leading-relaxed font-bold pb-4 mb-4 border-b border-emerald-100 bg-emerald-50/40 p-4 rounded-xl text-justify border-l-4 border-l-emerald-600">
                     {(article as any).description}
                   </p>
                 )}

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

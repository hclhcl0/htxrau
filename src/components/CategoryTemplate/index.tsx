import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { CategoryCover } from '@/components/CategoryCover';
import { SidebarBanners } from '@/components/SidebarBanners';
import { GenericCategorySidebar } from '@/components/GenericCategorySidebar';
import { sortTopicsByArticleCount } from '@/lib/sortTopicsByArticleCount';

interface CategoryTemplateProps {
  category: any;
  slugArray: string[];
  page?: number;
}

export async function CategoryTemplate({ category, slugArray, page = 1 }: CategoryTemplateProps) {
  const payload = await getPayload({ config: configPromise });

  // Xác định chuyên mục gốc (root): nếu category có parent thì root là parent, ngược lại chính nó là root
  let rootCat = category;
  let activeTopic: any = null;
  let activeSubTopic: any = null;

  if (category.parent) {
    const parentObj = typeof category.parent === 'object' ? category.parent : null;
    if (parentObj) {
      // Category hiện tại là cấp 1 (topic), kiểm tra xem parent có parent không
      if (parentObj.parent) {
        // Category hiện tại là cấp 2 (subtopic)
        const grandParentObj = typeof parentObj.parent === 'object' ? parentObj.parent : null;
        if (grandParentObj) {
          rootCat = grandParentObj;
          activeTopic = parentObj;
          activeSubTopic = category;
        } else {
          rootCat = parentObj;
          activeSubTopic = category;
        }
      } else {
        rootCat = parentObj;
        activeTopic = category;
      }
    }
  }

  // Lấy chuyên mục cấp 1 (con của rootCat)
  const { docs: topics } = await payload.find({
    collection: 'categories',
    where: { parent: { equals: rootCat.id } },
    sort: 'orderNum',
    limit: 100,
    depth: 0,
  });

  // Lấy tất cả chuyên mục cấp 2 (con của các topics)
  const topicIds = topics.map((t: any) => t.id);
  const { docs: allSubTopics } = topicIds.length > 0
    ? await payload.find({
        collection: 'categories',
        where: { parent: { in: topicIds } },
        sort: 'orderNum',
        limit: 500,
        depth: 0,
      })
    : { docs: [] };

  // Gắn children vào từng topic
  const topicsRaw = topics.map((t: any) => ({
    ...t,
    children: allSubTopics.filter((s: any) =>
      (typeof s.parent === 'object' ? s.parent?.id : s.parent) === t.id
    ),
  }));

  // Sắp xếp topic theo số bài viết (nhiều nhất lên trên)
  const topicsWithChildren = await sortTopicsByArticleCount(topicsRaw);

  // Xác định bộ lọc bài viết
  let filterIds: string[] = [];
  if (activeSubTopic) {
    filterIds = [activeSubTopic.id];
  } else if (activeTopic) {
    const childIds = (topicsWithChildren.find((t: any) => t.id === activeTopic.id)?.children || []).map((c: any) => c.id);
    filterIds = [activeTopic.id, ...childIds];
  } else {
    // Đang ở trang gốc: lấy tất cả bài của cây chuyên mục
    const subIds = allSubTopics.map((s: any) => s.id);
    filterIds = [rootCat.id, ...topicIds, ...subIds];
  }

  const articleFilter = { category: { in: filterIds } };

  // Truy vấn bài viết
  const { docs: articles, totalPages, page: currentPage, hasPrevPage, hasNextPage } = await payload.find({
    collection: 'articles',
    where: { ...articleFilter, _status: { equals: 'published' } },
    sort: ['-isPinned', '-publishedAt'],
    limit: 12,
    page,
    depth: 1,
  });

  const currentCategory = activeSubTopic || activeTopic || rootCat;
  const basePath = `/${rootCat.slug}`;

  // Tìm số con của activeTopic (nếu đang xem một topic cụ thể)
  const activeTopicChildren = activeTopic
    ? (topicsWithChildren.find((t: any) => t.id === activeTopic.id)?.children?.length ?? 0)
    : 0;

  // Hiện sidebar khi:
  // - Đang ở trang gốc (rootCat) VÀ có topics → sidebar
  // - Đang xem một subtopic → sidebar (topic cha có children)
  // - Đang xem một topic CÓ sub-topics → sidebar
  // Full-width khi:
  // - Không có topics ở trang gốc
  // - Đang xem topic LÁ (không có children)
  const hasTopics =
    !activeTopic
      ? topicsWithChildren.length > 0   // trang root: có topics thì show sidebar
      : activeSubTopic
        ? true                            // đang ở subtopic: luôn show sidebar
        : activeTopicChildren > 0;        // đang ở topic: chỉ show sidebar nếu có children

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <div className="container mx-auto px-4 max-w-7xl py-6 flex-grow">

        {hasTopics ? (
          /* ── Layout có Sidebar (khi có chuyên mục con) ── */
          <div className="flex flex-col lg:flex-row gap-8">
            <GenericCategorySidebar
              basePath={basePath}
              rootName={rootCat.name}
              topics={topicsWithChildren}
              activeSlug={activeTopic?.slug}
              activeSubSlug={activeSubTopic?.slug}
            >
              <SidebarBanners />
            </GenericCategorySidebar>

            <main className="flex-grow min-w-0">
              <CategoryCover category={currentCategory} />

              {articles.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                  <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                  <p>Chưa có bài viết nào trong chuyên mục này.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {articles.map((article: any) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                  <div className="mt-8">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage || 1}
                      hasPrevPage={hasPrevPage}
                      hasNextPage={hasNextPage}
                    />
                  </div>
                </>
              )}
            </main>
          </div>
        ) : (
          /* ── Layout Full-Width (khi không có chuyên mục con) ── */
          <main className="w-full">
            <CategoryCover category={currentCategory} />

            {/* Tiêu đề chuyên mục */}
            {!currentCategory.coverImage && (
              <div className="mb-6">
                <h1
                  className="text-2xl md:text-3xl font-bold pb-2 border-b-2 inline-block uppercase tracking-wide"
                  style={{
                    color: currentCategory.color || rootCat.color || '#0056b3',
                    borderColor: currentCategory.color || rootCat.color || '#0056b3',
                  }}
                >
                  {currentCategory.name}
                </h1>
                {currentCategory.description && (
                  <p className="text-gray-500 mt-2 text-sm max-w-3xl">{currentCategory.description}</p>
                )}
              </div>
            )}

            {articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                <p>Chưa có bài viết nào trong chuyên mục này.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {articles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage || 1}
                    hasPrevPage={hasPrevPage}
                    hasNextPage={hasNextPage}
                  />
                </div>
              </>
            )}
          </main>
        )}

      </div>
    </div>
  );
}

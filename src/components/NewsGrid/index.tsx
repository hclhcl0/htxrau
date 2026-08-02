// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Eye, Calendar } from 'lucide-react';
import styles from './NewsGrid.module.css';
import { NewsGridSliderClient } from './NewsGridSliderClient';

interface NewsGridProps {
  categoryId?: string | number;
  categoryName?: string;
  categorySlug?: string;
  limitOverride?: number;
  layoutOverride?: string;
  excludeId?: string | number;
  disableContainer?: boolean;
  preloadedArticles?: any[]; // P4: pass pre-fetched related articles
}

async function getLatestArticles(limit: number, categoryId?: string | number, excludeId?: string | number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const query: any = {
      collection: 'articles',
      sort: '-publishedAt',
      limit: limit,
      depth: 1,
      where: {
        and: [
          { _status: { equals: 'published' } }
        ]
      }
    };
    
    if (categoryId) {
        query.where.and.push({
          or: [
            { category: { equals: categoryId } },
            { additionalCategories: { equals: categoryId } }
          ]
        });
    }
    
    if (excludeId) {
        query.where.and.push({ id: { not_equals: excludeId } });
    }

    
    const { docs } = await payload.find(query);
    return docs;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

async function getNewsSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings' });
    return {
      limit: settings?.homeNewsLimit || 10,
      desktopCols: settings?.homeNewsColumnsDesktop || 5,
      mobileCols: settings?.homeNewsColumnsMobile || 2,
      homeNewsLayout: settings?.homeNewsLayout || 'grid',
    };
  } catch(e) {
    return { limit: 10, desktopCols: 5, mobileCols: 2, homeNewsLayout: 'grid' };
  }
}

// Helper: kiểm tra URL nội bộ
function isInternalUrl(url: string) {
  if (!url) return false;
  return url.startsWith('/') || url.startsWith('./') || url.includes('ecdc.vnos.org');
}

export const NewsGrid = async ({ categoryId, categoryName, categorySlug, limitOverride, layoutOverride, excludeId, disableContainer, preloadedArticles }: NewsGridProps) => {
  const { limit: defaultRows, desktopCols, mobileCols, homeNewsLayout } = await getNewsSettings();
  const actualLimit = limitOverride || defaultRows || 8;
  // Dùng preloadedArticles nếu có (P4 smart fetch), ngược lại fetch theo category
  const articles = preloadedArticles ?? await getLatestArticles(actualLimit, categoryId, excludeId);
  
  const title = categoryName ? categoryName.toUpperCase() : 'THÔNG TIN MỚI NHẤT';

  const layout = layoutOverride || (categoryId ? 'grid' : homeNewsLayout);

  if (!articles || articles.length === 0) {
    return (
      <section className={`${styles.newsSection} ${disableContainer ? '!py-0' : ''}`}>
        <div className={disableContainer ? "w-full" : "container"}>
          <div className="p-2 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
            <div className="global-section-header">
              <h2 className="global-section-title">
                {title}
              </h2>
            </div>
            <p>Chưa có bài viết nào.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.newsSection} ${disableContainer ? '!py-0' : ''}`}>
      <div className={disableContainer ? "w-full" : "container"}>
        <div className="p-2 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
          <div className="global-section-header">
          <h2 className="global-section-title">
            {title}
          </h2>
          {categorySlug && (
            <Link href={`/${categorySlug}`} className={styles.viewMore} prefetch={true}>
              Xem thêm &raquo;
            </Link>
          )}
        </div>
        
        {layout === 'slider' ? (
          <NewsGridSliderClient 
            articles={articles} 
            desktopCols={desktopCols} 
            mobileCols={mobileCols} 
          />
        ) : layout === 'list' ? (
          <div className={styles.listContainer}>
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || '/logo.png';
              const catName = article.category?.name || 'Tin tức';
              return (
                <article key={article.id} className={styles.listItem}>
                  <div className={styles.listImage}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {/* Phase 2: next/image — mobile nhận ảnh nhỏ + WebP tự động */}
                      <Image
                        src={mediaUrl}
                        alt={article.title}
                        width={320}
                        height={200}
                        sizes="(max-width: 640px) 40vw, 200px"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        quality={60}
                        unoptimized={!isInternalUrl(mediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.listBody}>
                    <h3 className={styles.listTitle}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    {article.description && (
                      <p className={styles.listExcerpt}>{article.description}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : layout === 'compact' ? (
          <div className={styles.compactContainer}>
            {articles.map((article: any) => {
              return (
                <div key={article.id} className={styles.compactItem}>
                  <div className={styles.compactTitle}>
                    <span className="text-[var(--primary)] mr-1.5">•</span>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {article.title}
                    </Link>
                  </div>
                  <span className={styles.compactDate}>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : layout === 'list-small' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {articles.map((article: any) => {
              const sideMediaUrl = article.image?.url || '/logo.png';
              const sideCatName = article.category?.name || 'Tin tức';

              return (
                <article key={article.id} className={styles.sideItem}>
                  <div className={styles.sideImage}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      <Image
                        src={sideMediaUrl}
                        alt={article.title}
                        width={120}
                        height={80}
                        sizes="(max-width: 640px) 30vw, 120px"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        quality={60}
                        unoptimized={!isInternalUrl(sideMediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.sideBody}>
                    <h4 className={styles.sideTitle}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h4>

                  </div>
                </article>
              );
            })}
          </div>
        ) : layout === 'featured' ? (
          (() => {
            const featuredArticle = articles[0];
            const sideArticles = articles.slice(1);
            const featuredMediaUrl = featuredArticle.image?.url || '/logo.png';
            const featuredCatName = featuredArticle.category?.name || 'Tin tức';

            return (
              <div className={styles.featuredContainer}>
                {/* Left side: Big Featured Card */}
                <div className={styles.bigCard}>
                  <div className={styles.bigImageHolder}>
                    <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                      {/* Phase 2: priority + WebP — ảnh đầu tiên Above The Fold */}
                      <Image
                        src={featuredMediaUrl}
                        alt={featuredArticle.title}
                        width={720}
                        height={405}
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="w-full h-full object-cover"
                        priority
                        quality={60}
                        unoptimized={!isInternalUrl(featuredMediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.bigBody}>
                    <h3 className={styles.bigTitle}>
                      <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                        {featuredArticle.title}
                      </Link>
                    </h3>
                    {featuredArticle.description && (
                      <p className={styles.bigExcerpt}>{featuredArticle.description}</p>
                    )}

                  </div>
                </div>

                {/* Right side: List of side articles */}
                <div className={styles.sideList}>
                  {sideArticles.map((article: any) => {
                    const sideMediaUrl = article.image?.url || '/logo.png';
                    const sideCatName = article.category?.name || 'Tin tức';

                    return (
                      <article key={article.id} className={styles.sideItem}>
                        <div className={styles.sideImage}>
                          <Link href={`/bai-viet/${article.slug || article.id}`}>
                            <Image
                              src={sideMediaUrl}
                              alt={article.title}
                              width={160}
                              height={100}
                              sizes="(max-width: 640px) 30vw, 160px"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              quality={60}
                              unoptimized={!isInternalUrl(sideMediaUrl)}
                            />
                          </Link>
                        </div>
                        <div className={styles.sideBody}>
                          <h4 className={styles.sideTitle}>
                            <Link href={`/bai-viet/${article.slug || article.id}`}>
                              {article.title}
                            </Link>
                          </h4>

                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : layout === 'featured-stacked' ? (
          (() => {
            const featuredArticle = articles[0];
            const listArticles = articles.slice(1);
            const featuredMediaUrl = featuredArticle.image?.url || '/logo.png';
            return (
              <div>
                {/* ── Ảnh lớn bài tiêu điểm ── */}
                <div className={styles.bigCard} style={{ marginBottom: 12 }}>
                  <div className={styles.bigImageHolder}>
                    <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                      <Image
                        src={featuredMediaUrl}
                        alt={featuredArticle.title}
                        width={960}
                        height={540}
                        sizes="(max-width: 768px) 100vw, 80vw"
                        className="w-full h-full object-cover"
                        priority
                        quality={70}
                        unoptimized={!isInternalUrl(featuredMediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.bigBody}>
                    <h3 className={styles.bigTitle}>
                      <Link href={`/bai-viet/${featuredArticle.slug || featuredArticle.id}`}>
                        {featuredArticle.title}
                      </Link>
                    </h3>
                    {featuredArticle.description && (
                      <p className={styles.bigExcerpt}>{featuredArticle.description}</p>
                    )}
                  </div>
                </div>

                {/* ── Danh sách tin nhỏ bên dưới (dạng list) ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {listArticles.map((article: any) => {
                    const smallUrl = article.image?.url || '/logo.png';
                    return (
                      <article
                        key={article.id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          padding: '8px 0',
                          borderBottom: '1px solid #f0f0f0',
                          alignItems: 'center',
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{ flexShrink: 0, width: 88, height: 60, borderRadius: 6, overflow: 'hidden', background: '#eee' }}>
                          <Link href={`/bai-viet/${article.slug || article.id}`}>
                            <Image
                              src={smallUrl}
                              alt={article.title}
                              width={88}
                              height={60}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              quality={60}
                              unoptimized={!isInternalUrl(smallUrl)}
                            />
                          </Link>
                        </div>
                        {/* Tiêu đề */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link
                            href={`/bai-viet/${article.slug || article.id}`}
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              lineHeight: 1.4,
                              color: '#1a1a2e',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textDecoration: 'none',
                            }}
                          >
                            {article.title}
                          </Link>
                          {article.publishedAt && (
                            <p style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
                              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : (
          <div 
            className={styles.grid} 
            style={{ 
              '--desktop-cols': desktopCols,
              '--mobile-cols': mobileCols
            } as React.CSSProperties}
          >
            {articles.map((article: any) => {
              const mediaUrl = article.image?.url || '/logo.png';
              const catName = article.category?.name || 'Tin tức';
              
              return (
                <article key={article.id} className={styles.card}>
                  <div className={styles.imageHolder}>
                    <Link href={`/bai-viet/${article.slug || article.id}`}>
                      {/* Phase 2: next/image — mobile nhận ảnh nhỏ + WebP tự động */}
                      <Image
                        src={mediaUrl}
                        alt={article.title}
                        width={400}
                        height={240}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        quality={60}
                        unoptimized={!isInternalUrl(mediaUrl)}
                      />
                    </Link>
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      <Link href={`/bai-viet/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h3>

                  </div>
                </article>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  );
};

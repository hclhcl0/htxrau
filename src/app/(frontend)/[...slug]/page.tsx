import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Phone, Mail, MapPin, Clock } from 'lucide-react';

export const revalidate = 60; // ISR: cache trang 60 giây, tránh SSR mỗi request

import { PageBlockRenderer } from '@/components/PageBlocks/PageBlockRenderer';
import { SidebarRenderer } from '@/components/SidebarRenderer';
import { ContactForm } from '@/components/ContactForm';
import { CategoryTemplate } from '@/components/CategoryTemplate';

// ─────────────────────────────────────────────
// Pre-build tất cả trang chuyên mục và pages lúc deploy
// → phục vụ từ CDN, không cần SSR mỗi request
// ─────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise });

    const [categoriesRes, pagesRes] = await Promise.all([
      payload.find({ collection: 'categories', limit: 200, depth: 0 }),
      payload.find({ collection: 'pages', limit: 200, depth: 0 }),
    ]);

    const slugs: { slug: string[] }[] = [];

    for (const cat of categoriesRes.docs) {
      if (cat.slug) slugs.push({ slug: [cat.slug] });
    }

    for (const page of pagesRes.docs) {
      const s = (page as any).slug as string | undefined;
      if (s) slugs.push({ slug: s.split('/').filter(Boolean) });
    }

    return slugs;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Data fetcher
// ─────────────────────────────────────────────
async function getCategoryBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });
    const slugParts = slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: lastPart } },
      limit: 1,
      depth: 2,
    });
    return docs.length > 0 ? docs[0] : null;
  } catch (err) {
    console.error('[DynamicPage] Failed to fetch category:', err);
    return null;
  }
}
// ─────────────────────────────────────────────
async function getPageBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    return docs.length > 0 ? docs[0] : null;
  } catch (err) {
    console.error('[DynamicPage] Failed to fetch page:', err);
    return null;
  }
}

// ─────────────────────────────────────────────
// generateMetadata — SEO đầy đủ
// ─────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  const page = await getPageBySlug(slug);
  if (!page) {
    const category = await getCategoryBySlug(slug);
    if (category) {
      return {
        title: `${category.name} | Rau Sạch VietGAP`,
        description: category.description || '',
      };
    }
    return { title: 'Không tìm thấy trang' };
  }

  const seo = (page as any).seo || {};
  const seoTitle = seo.title || page.title;
  const seoDesc = seo.description || '';
  const ogImageUrl = seo.ogImage?.url || '';

  return {
    title: `${seoTitle} | CDC Đà Nẵng`,
    description: seoDesc,
    openGraph: {
      title: `${seoTitle} | CDC Đà Nẵng`,
      description: seoDesc,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: 'website',
    },
  };
}

// ─────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────
function Breadcrumb({ title }: { title: string }) {
  return null;
}

// ─────────────────────────────────────────────
// Contact Page template
// ─────────────────────────────────────────────
function ContactPageTemplate({ page }: { page: any }) {
  const content = (page as any).content || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumb title={page.title} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--primary)] mb-2">{page.title}</h1>
        <div className="h-1 w-20 bg-[var(--primary)] rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* Form cột trái */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Gửi thông tin liên hệ</h2>
          <ContactForm />
        </div>

        {/* Info cột phải */}
        <div className="space-y-5">
          {/* Thông tin liên hệ */}
          <div className="bg-[var(--primary)] text-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-5">Thông tin liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-white/80" />
                <span className="text-white/90 text-sm">Thôn Túy Loan Đông, Xã Hòa Phong, H. Hòa Vang, TP. Đà Nẵng</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={18} className="flex-shrink-0 text-white/80" />
                <a href="tel:0905559206" className="text-white/90 text-sm hover:text-white transition-colors">0905 559 206</a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={18} className="flex-shrink-0 text-white/80" />
                <a href="mailto:contact@rautuyloan.vn" className="text-white/90 text-sm hover:text-white transition-colors break-all">contact@rautuyloan.vn</a>
              </li>
              <li className="flex gap-3 items-start">
                <Clock size={18} className="mt-0.5 flex-shrink-0 text-white/80" />
                <div className="text-white/90 text-sm">
                  <div>Thứ 2 – Chủ nhật: 06:00 – 18:00</div>
                  <div>Giao hàng trong ngày</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Blocks nếu có */}
          {content.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <PageBlockRenderer blocks={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────
export default async function DynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug: slugArray } = await params;
  const sp = await searchParams;
  const pageNumber = typeof sp.page === 'string' ? parseInt(sp.page) : 1;
  const slug = slugArray.join('/');

  const page = await getPageBySlug(slug);

  if (!page) {
    const category = await getCategoryBySlug(slug);
    if (category) {
      return <CategoryTemplate category={category} slugArray={slugArray} page={pageNumber} />;
    }
    notFound();
  }

  const pageType = (page as any).pageType || 'standard';
  const layout = (page as any).layout || 'withSidebar';
  const content = (page as any).content || [];

  // ── Trang liên hệ ──────────────────────────
  if (pageType === 'contact') {
    return <ContactPageTemplate page={page} />;
  }

  // ── Layout: toàn chiều rộng ─────────────────
  if (layout === 'fullWidth') {
    return (
      <div className="container mx-auto px-4 pt-2 md:pt-4 pb-8 max-w-7xl">
        <Breadcrumb title={page.title} />
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-2">{page.title}</h1>
        <div className="h-1 w-20 bg-[var(--primary)] rounded-full mb-8" />
        {content.length > 0 ? (
          <PageBlockRenderer blocks={content} />
        ) : (
          <div className="text-gray-400 text-center py-16">Nội dung đang được cập nhật...</div>
        )}
      </div>
    );
  }

  // ── Layout: nội dung hẹp ────────────────────
  if (layout === 'narrow') {
    return (
      <div className="container mx-auto px-4 pt-2 md:pt-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb title={page.title} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--primary)] mb-6 pb-4 border-b border-gray-100">
              {page.title}
            </h1>
            {content.length > 0 ? (
              <PageBlockRenderer blocks={content} />
            ) : (
              <div className="text-gray-400 text-center py-10">Nội dung đang được cập nhật...</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Layout: có sidebar (mặc định) ──────────
  const payload = await getPayload({ config: configPromise });
  const { docs: latestArticles } = await payload.find({
    collection: 'articles',
    sort: '-publishedAt',
    limit: 5,
  });
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 20,
    where: { parent: { exists: false } },
  });

  let sidebarWidgets: any[] = [];
  try {
    const globalSettings = await payload.findGlobal({ slug: 'site-settings', depth: 2 });
    sidebarWidgets = (globalSettings as any).sidebarWidgets || [];
  } catch {}

  const hasCategories = sidebarWidgets.some(w => w.blockType === 'categoriesWidget');
  const hasRecent = sidebarWidgets.some(w => w.blockType === 'recentArticlesWidget');
  
  if (!hasCategories) {
    sidebarWidgets.push({ id: 'default-categories', blockType: 'categoriesWidget', title: 'Chuyên mục', limit: 10 });
  }
  if (!hasRecent) {
    sidebarWidgets.push({ id: 'default-recent', blockType: 'recentArticlesWidget', title: 'Tin mới cập nhật', limit: 5 });
  }

  return (
    <div className="container mx-auto px-4 pt-2 md:pt-4 pb-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Main */}
        <div>
          <Breadcrumb title={page.title} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:py-10 md:px-12">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--primary)] mb-6 pb-4 border-b border-gray-100 leading-tight">
              {page.title}
            </h1>
            {content.length > 0 ? (
              <PageBlockRenderer blocks={content} />
            ) : (
              <div className="text-gray-400 text-center py-10">Nội dung đang được cập nhật...</div>
            )}
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

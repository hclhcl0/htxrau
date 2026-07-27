import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { TikTokSidebarSlot } from './NewsSidebarLayout/TikTokSidebarSlot';

interface SidebarRendererProps {
  widgets?: any[];
  latestArticles: any[];
  categories: any[];
}

// Tiêu đề widget: nền xanh gov-primary, chữ trắng, sát top
function WidgetTitle({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <h3 className="bg-gov-primary text-white text-[0.9rem] font-bold uppercase tracking-wide px-5 py-2 -mx-5 -mt-5 mb-4 rounded-t-2xl">
      {title}
    </h3>
  );
}

export function SidebarRenderer({ widgets, latestArticles, categories }: SidebarRendererProps) {
  if (!widgets || widgets.length === 0) return null;

  return (
    <aside className="space-y-8 min-w-0 lg:sticky lg:top-8 self-start no-print w-full">
      {widgets.map((widget: any, index: number) => {
        const key = widget.id || index;

        switch (widget.blockType) {
          // 1. Render Chuyên mục
          case 'categoriesWidget':
            const limitCat = widget.limit || 10;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 overflow-hidden">
                <WidgetTitle title={widget.title} />
                <ul className="flex flex-col list-none p-0 m-0">
                  {categories.slice(0, limitCat).map((cat: any) => (
                    <li key={cat.id} className="border-b border-slate-200/60 last:border-0">
                      <Link href={`/${cat.slug || cat.id}`} className="flex items-center justify-between py-2 text-slate-700 hover:text-gov-primary transition-colors group">
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-gov-primary group-hover:scale-125 transition-all shrink-0"></span>
                           <span className="font-medium text-[13.5px] leading-snug">{cat.name}</span>
                        </div>
                        <span className="text-gov-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );

          // 2. Render Bài viết mới
          case 'recentArticlesWidget':
            const limitArt = widget.limit || 5;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 overflow-hidden">
                <WidgetTitle title={widget.title} />
                <ul className="space-y-3 list-none p-0 m-0">
                  {latestArticles.slice(0, limitArt).map((post: any) => (
                    <li key={post.id} className="group border-b border-slate-200/60 last:border-0 pb-3 last:pb-0">
                      <Link href={`/bai-viet/${post.slug || post.id}`} className="block">
                        <h4 className="font-medium text-slate-800 group-hover:text-gov-primary transition-colors line-clamp-2 text-[13px] leading-snug">
                          {post.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                          <Calendar size={11} />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );

          // 3. Render TikTok Embed
          case 'tiktokWidget':
            if (!widget.channel) return null;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 overflow-hidden">
                <WidgetTitle title={widget.title} />
                <TikTokSidebarSlot
                  handle={widget.channel.tiktokHandle}
                  channelName={widget.channel.name}
                  channelUrl={widget.channel.channelUrl}
                  avatarUrl={widget.channel.avatar?.url}
                />
              </div>
            );

          // 4. Render Facebook Page Plugin
          case 'facebookWidget':
            const fbUrl = widget.pageUrl || 'https://www.facebook.com/cdcdanang';
            const fbHeight = widget.height || 350;
            const iframeSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbUrl)}&tabs=timeline&width=340&height=${fbHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 overflow-hidden">
                <WidgetTitle title={widget.title} />
                <div className="w-full overflow-hidden flex justify-center">
                  <iframe
                    src={iframeSrc}
                    width="100%"
                    height={fbHeight}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              </div>
            );

          // 5. Render Banner Quảng cáo
          case 'bannerWidget':
            if (!widget.image?.url) return null;
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {widget.title && (
                   <h3 className="bg-gov-primary text-white text-[0.9rem] font-bold uppercase tracking-wide px-5 py-2">
                     {widget.title}
                   </h3>
                )}
                <Link 
                  href={widget.linkUrl || '#'} 
                  target={widget.openInNewTab ? '_blank' : '_self'}
                  className="block hover:opacity-95 transition-opacity p-[5px]"
                >
                  <img 
                    src={widget.image?.url} 
                    alt={widget.title || "Banner"} 
                    className="w-full h-auto block rounded-xl"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </div>
            );

          // 6. Render HTML Tùy chỉnh (Dành cho mã nhúng bên thứ 3)
          case 'customHtmlWidget':
            return (
              <div key={key} className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200 p-5 overflow-hidden">
                <WidgetTitle title={widget.title} />
                <div dangerouslySetInnerHTML={{ __html: widget.htmlContent }} />
              </div>
            );

          default:
            return null;
        }
      })}
    </aside>
  );
}

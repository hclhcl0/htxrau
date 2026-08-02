import React from 'react';
import { NewsGrid } from '@/components/NewsGrid';
import { BannerSection } from './BannerSection';
import { MultiBannerSection } from './MultiBannerSection';
import { StatsSection } from './StatsSection';
import { QuickLinksSection } from './QuickLinksSection';
import { RichTextSection } from './RichTextSection';
import { VideoSection } from './VideoSection';
import { TikTokSection } from './TikTokSection';
import { ScheduleBlock } from '../blocks/ScheduleBlock';
import { VaccineSection } from './VaccineSection';
import { AdSlider } from './AdSlider';

interface HomeSectionRendererProps {
  sections: any[];
}

export async function HomeSectionRenderer({ sections }: HomeSectionRendererProps) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((section: any, index: number) => {
        const blockType = section.blockType;

        switch (blockType) {
          case 'latestNewsSection': {
            const ad = section.adSlider;
            const hasAd = ad?.enabled && ad?.slides?.length > 0;
            return (
              <div key={`${blockType}-${index}`} className="container">
                <div className={hasAd ? 'flex gap-4 items-start' : ''}>
                  {/* Cột tin tức */}
                  <div className={hasAd ? 'flex-1 min-w-0' : 'w-full'}>
                    <NewsGrid
                      limitOverride={section.limit}
                      layoutOverride={section.layout}
                      disableContainer
                    />
                  </div>
                  {/* Sidebar quảng cáo — desktop: bên phải, mobile: ẩn (xem bên dưới) */}
                  {hasAd && (
                    <div className="hidden lg:block flex-shrink-0 w-[235px] xl:w-[274px] sticky top-[100px]">
                      <AdSlider
                        slides={ad.slides}
                        title={ad.title}
                        autoplayInterval={ad.autoplayInterval ?? 5}
                      />
                    </div>
                  )}
                </div>
                {/* Sidebar quảng cáo — mobile: bên dưới */}
                {hasAd && (
                  <div className="lg:hidden mt-4">
                    <AdSlider
                      slides={ad.slides}
                      title={ad.title}
                      autoplayInterval={ad.autoplayInterval ?? 5}
                    />
                  </div>
                )}
              </div>
            );
          }

          case 'newsCategorySection': {
            const catObj = typeof section.category === 'object' ? section.category : null;
            const catId = catObj ? catObj.id : section.category;
            const catName = catObj ? catObj.name : 'Chuyên mục';
            const catSlug = catObj ? catObj.slug : '';
            return (
              <NewsGrid
                key={`${blockType}-${index}`}
                categoryId={catId}
                categoryName={catName}
                categorySlug={catSlug}
                limitOverride={section.limit}
                layoutOverride={section.layout}
              />
            );
          }

          case 'bannerSection':
            return (
              <BannerSection
                key={`${blockType}-${index}`}
                image={section.image}
                title={section.title}
                subtitle={section.subtitle}
                linkUrl={section.linkUrl}
                openInNewTab={section.openInNewTab}
                style={section.style}
              />
            );

          case 'multiBannerSection':
            return (
              <MultiBannerSection
                key={`${blockType}-${index}`}
                title={section.title}
                columns={section.columns}
                bannerHeight={section.bannerHeight}
                banners={section.banners || []}
              />
            );

          case 'videoSection':
            return (
              <VideoSection
                key={`${blockType}-${index}`}
                title={section.title}
                sourceType={section.sourceType}
                channels={section.channels}
                manualVideos={section.manualVideos}
                limit={section.limit}
                layout={section.layout}
              />
            );

          case 'tiktokSection':
            return (
              <TikTokSection
                key={`${blockType}-${index}`}
                title={section.title}
                channel={section.channel}
                limit={section.limit}
              />
            );

          case 'statsSection':
            return (
              <StatsSection
                key={`${blockType}-${index}`}
                title={section.title}
                backgroundColor={section.backgroundColor}
                stats={section.stats || []}
              />
            );

          case 'scheduleBlock':
            return (
              <ScheduleBlock
                key={`${blockType}-${index}`}
                title={section.title}
                icon={section.icon}
                scheduleGroups={section.scheduleGroups}
                highlightBox={section.highlightBox}
                bottomNote={section.bottomNote}
              />
            );

          case 'quickLinksSection':
            return (
              <QuickLinksSection
                key={`${blockType}-${index}`}
                title={section.title}
                links={section.links || []}
              />
            );

          case 'richTextSection':
            return (
              <RichTextSection
                key={`${blockType}-${index}`}
                content={section.content}
              />
            );

          case 'vaccineSection':
            return (
              <VaccineSection
                key={`${blockType}-${index}`}
                title={section.title}
                subtitle={section.subtitle}
                limit={section.limit}
                showViewAll={section.showViewAll !== false}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

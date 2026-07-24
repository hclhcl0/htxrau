import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarouselClient } from './HeroCarouselClient';
import { WarningVideosClient } from './WarningVideosClient';
import { WarningToggleWrapper } from './WarningToggleWrapper';
import styles from './HeroCarousel.module.css';
import { VideoCardPopup } from '../HomeSections/VideoCardPopup';

async function getBanners() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'banners',
      where: {
        and: [
          { isActive: { equals: true } },
          { position: { equals: 'home_slider' } },
        ]
      },
      sort: 'order',
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

async function getWarningVideos() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'videos',
      sort: '-publishedDate',
      limit: 6,
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching warning videos:", error);
    return [];
  }
}

async function getSliderSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings' });
    const bannerConfig = (settings as any)?.banner || {};
    const warningSection = (settings as any)?.warningSection || {};
    return {
      size: bannerConfig.heroSliderSize || 'medium',
      customHeight: bannerConfig.heroSliderCustomHeight || 500,
      effect: bannerConfig.heroSliderEffect || 'slide',
      autoplay: bannerConfig.heroSliderAutoplay !== false,
      autoplayDelay: bannerConfig.heroSliderAutoplayDelay || 5000,
      warningEnabled: warningSection.isEnabled !== false, // default true
      warningTitle: warningSection.title || 'Cảnh báo quan trọng',
      warningIcon: warningSection.icon || '🔥',
      warningVideos: warningSection.videos || [],
    };
  } catch (error) {
    return {
      size: 'medium',
      customHeight: 500,
      effect: 'slide',
      autoplay: true,
      autoplayDelay: 5000,
      warningEnabled: true,
      warningTitle: 'Cảnh báo quan trọng',
      warningIcon: '🔥',
      warningVideos: [],
    };
  }
}

export const HeroCarousel = async () => {
  const banners = await getBanners();
  const settings = await getSliderSettings();

  // Lấy danh sách video: ưu tiên từ CMS settings, fallback auto-fetch
  let warningVideos = settings.warningVideos;
  if (!warningVideos || warningVideos.length === 0) {
    warningVideos = await getWarningVideos();
  }
  const showWarning = settings.warningEnabled && warningVideos && warningVideos.length > 0;

  if (!banners || banners.length === 0) {
    return (
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.banner}>
            <a href="#">
                <img src="https://via.placeholder.com/1200x500?text=Banner" alt="Default Banner" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-4 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Khung tổng bao quanh cả banner và cảnh báo */}
        <div className="p-1 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 lg:gap-3">
            {/* Cột trái: Slider Banner chính */}
            <div className={`aspect-[2/1] md:aspect-[2.5/1] h-auto w-full rounded-xl overflow-hidden ${
              showWarning ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-10 xl:col-span-10'
            }`}>
              <HeroCarouselClient 
                banners={banners} 
                globalSize={settings.size} 
                globalCustomHeight={settings.customHeight} 
                globalEffect={settings.effect} 
                globalAutoplay={settings.autoplay} 
                globalAutoplayDelay={settings.autoplayDelay} 
              />
            </div>

            {/* Cột phải: Cảnh báo quan trọng — có nút bật/tắt (admin + user) */}
            {showWarning && (
              <WarningToggleWrapper
                title={settings.warningTitle}
                icon={
                  settings.warningIcon.startsWith('http') || settings.warningIcon.startsWith('/') ? (
                    <img src={settings.warningIcon} alt="Warning Icon" className="w-5 h-5 object-contain" />
                  ) : (
                    settings.warningIcon
                  )
                }
              >
                <WarningVideosClient videos={warningVideos} />
              </WarningToggleWrapper>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarouselClient } from './HeroCarouselClient';

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

async function getSliderSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings' });
    const bannerConfig = (settings as any)?.banner || {};
    return {
      size: bannerConfig.heroSliderSize || 'medium',
      customHeight: bannerConfig.heroSliderCustomHeight || 500,
      effect: bannerConfig.heroSliderEffect || 'slide',
      autoplay: bannerConfig.heroSliderAutoplay !== false,
      autoplayDelay: bannerConfig.heroSliderAutoplayDelay || 5000,
    };
  } catch (error) {
    return {
      size: 'medium',
      customHeight: 500,
      effect: 'slide',
      autoplay: true,
      autoplayDelay: 5000,
    };
  }
}

export const HeroCarousel = async () => {
  const banners = await getBanners();
  const settings = await getSliderSettings();

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-4 bg-gray-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="p-1 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="w-full rounded-xl overflow-hidden">
            <HeroCarouselClient 
              banners={banners} 
              globalSize={settings.size} 
              globalCustomHeight={settings.customHeight} 
              globalEffect={settings.effect} 
              globalAutoplay={settings.autoplay} 
              globalAutoplayDelay={settings.autoplayDelay} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

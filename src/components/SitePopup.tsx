import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';
import { SitePopupClient } from './SitePopupClient';
import { ServicesPopupClient } from './ServicesPopupClient';

export interface SitePopupProps {
  popupConfig?: {
    enabled?: boolean | null;
    type?: string | null;
    article?: any;
    title?: string | null;
    image?: any;
    content?: any;
    linkUrl?: string | null;
    delaySeconds?: number | null;
    showOnce?: boolean | null;
    transparentBackground?: boolean | null;
    videoUrl?: string | null;
    // Services popup fields
    servicesTitle?: string | null;
    servicesSubtitle?: string | null;
    servicesMascot?: any;
    servicesHeaderColor?: string | null;
    servicesItems?: {
      id?: string;
      icon?: string;
      iconImage?: { url: string; alt?: string } | null;
      title: string;
      description?: string;
      linkUrl?: string;
    }[];
  };
}

export function SitePopup({ popupConfig }: SitePopupProps) {
  if (!popupConfig?.enabled) return null;

  // ── Services popup ──────────────────────────────────────────
  if (popupConfig.type === 'services') {
    const items = (popupConfig.servicesItems || []).filter(i => i.title);
    return (
      <ServicesPopupClient
        title={popupConfig.servicesTitle || 'Dịch vụ & Thông báo CDC Đà Nẵng'}
        subtitle={popupConfig.servicesSubtitle || undefined}
        mascotImage={popupConfig.servicesMascot || null}
        headerColor={popupConfig.servicesHeaderColor || '#00a99d'}
        items={items}
        delaySeconds={popupConfig.delaySeconds ?? 1}
        showOnce={popupConfig.showOnce ?? true}
        storageKey="cdc_services_popup_closed"
      />
    );
  }

  // ── Original popup (article / manual) ──────────────────────
  const isArticle = popupConfig.type === 'article' && popupConfig.article;
  const displayTitle = isArticle ? popupConfig.article.title : popupConfig.title;
  const displayImage = isArticle ? popupConfig.article.image : popupConfig.image;
  const displayLinkUrl = isArticle ? `/bai-viet/${popupConfig.article.slug}` : popupConfig.linkUrl;
  const articleDescription = isArticle ? popupConfig.article.description : null;
  const transparentBackground = popupConfig.transparentBackground;

  const renderedContent = !isArticle && popupConfig.content ? (
    <RichText
      data={popupConfig.content}
      converters={getJsxConverters('Hình minh họa Popup')}
    />
  ) : null;

  return (
    <SitePopupClient
      displayTitle={displayTitle}
      displayImage={displayImage}
      displayLinkUrl={displayLinkUrl}
      isArticle={isArticle}
      articleDescription={articleDescription}
      renderedContent={renderedContent}
      delaySeconds={popupConfig.delaySeconds}
      showOnce={popupConfig.showOnce}
      transparentBackground={transparentBackground}
      displayVideoUrl={popupConfig.videoUrl}
      mascotImage={popupConfig.servicesMascot || null}
      headerColor={popupConfig.servicesHeaderColor || '#00a99d'}
    />
  );
}

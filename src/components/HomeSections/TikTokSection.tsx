import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import TikTokChannelEmbed from '@/components/TikTokChannelEmbed';

interface TikTokSectionProps {
  title?: string;
  channel: { id: string } | string;
  limit?: number;
}

export async function TikTokSection({ title = 'KÊNH TIKTOK NÔNG TRẠI RAU SẠCH TÚY LOAN', channel }: TikTokSectionProps) {
  const channelId = typeof channel === 'object' ? (channel as any).id : channel;
  if (!channelId) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const doc = await payload.findByID({ collection: 'video-channels', id: channelId }) as any;
    if (!doc || !doc.tiktokHandle) return null;

    const mappedChannel = {
      id: String(doc.id),
      handle: doc.tiktokHandle,
      channelName: doc.name,
      channelUrl: doc.channelUrl,
      avatarUrl: doc.avatar?.url,
    };

    return (
      <section className="w-full py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="p-2 bg-white/70 border border-gray-200/50 rounded-2xl backdrop-blur-sm shadow-sm mb-6">
            <div className="global-section-header">
              <h2 className="global-section-title">
                {title || 'Video TikTok'}
              </h2>
              <a
                href={doc.channelUrl || `https://www.tiktok.com/@${doc.tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Xem thÃªm &raquo;
              </a>
            </div>
            <TikTokChannelEmbed channels={[mappedChannel]} />
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

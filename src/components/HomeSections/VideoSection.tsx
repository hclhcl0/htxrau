import React from 'react';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { VideoCardPopup } from './VideoCardPopup';
import VideoSliderClient from './VideoSliderClient';
import { PlayCircle } from 'lucide-react';

interface VideoSectionProps {
  title?: string;
  sourceType?: 'auto' | 'manual';
  channels?: { channel: string | { id: string } }[];
  manualVideos?: any[];
  limit?: number;
  layout?: 'grid' | 'featured';
}

async function getVideos(channelIds: string[], limit: number) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'videos',
      where: { channel: { in: channelIds } },
      sort: '-publishedDate',
      limit,
      depth: 1,
    });
    return docs;
  } catch {
    return [];
  }
}

export async function VideoSection({ 
  title = 'VIDEO NỔI BẬT', 
  sourceType = 'auto',
  channels, 
  manualVideos,
  limit = 10, 
  layout = 'grid' 
}: VideoSectionProps) {
  let videos: any[] = [];

  if (sourceType === 'manual') {
    if (!manualVideos || manualVideos.length === 0) return null;
    
    // Kiểm tra xem manualVideos đã được populate (có object) hay mới chỉ là mảng ID
    const isPopulated = typeof manualVideos[0] === 'object';
    if (isPopulated) {
      videos = manualVideos;
    } else {
      const payload = await getPayload({ config: configPromise });
      const { docs } = await payload.find({
        collection: 'videos',
        where: { id: { in: manualVideos } },
        depth: 1,
      });
      // Giữ nguyên thứ tự video đã được chọn
      videos = manualVideos.map(id => docs.find(d => d.id === id)).filter(Boolean);
    }
  } else {
    if (!channels || !Array.isArray(channels) || channels.length === 0) return null;

    const channelIds = channels
      .map(c => typeof c.channel === 'object' ? c.channel.id : c.channel)
      .filter(Boolean);

    if (channelIds.length === 0) return null;

    videos = await getVideos(channelIds, Math.max(limit, 10));
  }

  if (!videos.length) return null;

  const sectionTitle = title || 'VIDEO NỔI BẬT';

  return (
    <section className="w-full py-2">
      <div className="container">
        <div className="bg-gradient-to-t from-[#052e16] via-[#14532d] to-[#16a34a] rounded-xl p-1.5 md:p-2 relative overflow-hidden shadow-lg border-0">
          {/* Subtle dotted pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          
          {/* Concentric circles decoration */}
          <div className="absolute -bottom-16 -left-16 opacity-10 pointer-events-none z-0 rotate-45">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="99" stroke="white" strokeWidth="1"/>
              <circle cx="100" cy="100" r="79" stroke="white" strokeWidth="1" strokeDasharray="4 6"/>
              <circle cx="100" cy="100" r="59" stroke="white" strokeWidth="1"/>
            </svg>
          </div>

          {/* Glowing background orbs for depth */}
          <div className="absolute -top-20 -right-10 w-64 h-64 bg-white/20 blur-[50px] rounded-full pointer-events-none z-0"></div>
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-[var(--secondary)]/40 blur-[50px] rounded-full pointer-events-none"></div>

          {/* Sparkle decoration */}
          <div className="absolute top-2 right-6 opacity-80 pointer-events-none scale-75 lg:scale-100 hidden sm:block animate-pulse">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0L22.6517 14.502L34.1421 5.85786L25.498 17.3483L40 20L25.498 22.6517L34.1421 34.1421L22.6517 25.498L20 40L17.3483 25.498L5.85786 34.1421L14.502 22.6517L0 20L14.502 17.3483L5.85786 5.85786L17.3483 14.502L20 0Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          
          <div className="flex items-center gap-3 mb-1 px-1 relative z-10">
            <h2 className="text-base lg:text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-white" /> {sectionTitle}
            </h2>
            <span className="text-gray-500 font-light text-2xl mb-1">|</span>
            <Link href="/video" className="text-sm font-medium text-gray-300 hover:text-white hover:underline transition-colors mt-0.5">
              Xem tất cả &gt;
            </Link>
          </div>

          {layout === 'featured' && videos.length > 1 ? (
            <div className="grid md:grid-cols-[2fr_1fr] gap-4 relative z-10">
              {/* Main video */}
              <VideoCardPopup video={videos[0]} videoList={videos} initialIndex={0} isFeatured={true} />

              {/* Side list */}
              <div className="flex flex-col gap-3">
                {videos.slice(1).map((video: any, i: number) => (
                  <VideoCardPopup key={video.id} video={video} videoList={videos} initialIndex={i + 1} />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <VideoSliderClient>
                {videos.map((video: any, index: number) => (
                  <div 
                    key={video.id} 
                    className="flex-[0_0_35%] sm:flex-[0_0_calc(33.333%-0.375rem)] md:flex-[0_0_calc(25%-0.375rem)] lg:flex-[0_0_calc(16.666%-0.4rem)] min-w-0 aspect-[3/4]"
                  >
                    <VideoCardPopup video={video} videoList={videos} initialIndex={index} variant="vertical" />
                  </div>
                ))}
              </VideoSliderClient>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

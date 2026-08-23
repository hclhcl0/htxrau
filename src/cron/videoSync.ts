// @ts-nocheck
import cron from 'node-cron';
import type { Payload } from 'payload';

export function initVideoSyncCron(payload?: Payload) {
  // Chạy lúc 2h sáng mỗi ngày (0 2 * * *)
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Bắt đầu đồng bộ Video YouTube tự động...');
    try {
      if (!payload) return;
      
      const channelsResult = await payload.find({
        collection: 'video-channels' as any,
        where: { 
          platform: { equals: 'youtube' }, 
          channelId: { exists: true } 
        },
        limit: 100,
      });

      let totalSynced = 0;
      for (const channel of channelsResult.docs) {
        if (!(channel as any).channelId) continue;
        
        try {
          const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${(channel as any).channelId}`;
          const response = await fetch(rssUrl);
          if (!response.ok) continue;
          
          const xml = await response.text();
          const entries: any[] = [];
          const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
          let match;

          while ((match = entryRegex.exec(xml)) !== null) {
            const entryContent = match[1];
            const videoIdMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
            const dateMatch = entryContent.match(/<published>(.*?)<\/published>/);
            const mediaGroupMatch = entryContent.match(/<media:group>([\s\S]*?)<\/media:group>/);
            
            let description = '';
            if (mediaGroupMatch) {
              const descMatch = mediaGroupMatch[1].match(/<media:description>([\s\S]*?)<\/media:description>/);
              if (descMatch) description = descMatch[1];
            }

            if (videoIdMatch && titleMatch) {
              entries.push({
                videoId: videoIdMatch[1],
                title: titleMatch[1].trim(),
                publishedDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
                description: description.substring(0, 500).trim(), // Giới hạn 500 ký tự
              });
            }
          }

          if (entries.length === 0) continue;

          const existingVideosResult = await payload.find({
            collection: 'videos' as any,
            where: { channel: { equals: channel.id } },
            limit: 100,
          });
          const existingUrls = existingVideosResult.docs.map(doc => doc.videoUrl);

          for (const entry of entries.reverse()) {
            const videoUrl = `https://www.youtube.com/watch?v=${entry.videoId}`;
            if (!existingUrls.includes(videoUrl)) {
              await payload.create({
                collection: 'videos' as any,
                data: {
                  title: entry.title,
                  platform: 'youtube',
                  channel: channel.id,
                  videoUrl: videoUrl,
                  description: entry.description,
                  publishedDate: entry.publishedDate,
                },
              });
              totalSynced++;
            }
          }
        } catch (e) {
          console.error(`[CRON] Lỗi đồng bộ kênh ${channel.name}:`, e);
        }
      }
      console.log(`[CRON] Hoàn thành đồng bộ. Đã thêm tổng cộng ${totalSynced} video mới.`);
    } catch (error) {
      console.error('[CRON] Lỗi tổng thể khi đồng bộ Youtube:', error);
    }
  });
}

export const revalidate = 60;

import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import VideoLibraryClient from './VideoLibraryClient';

export const metadata = {
  title: 'Thư viện Video | HTX Rau An Toàn Túy Loan',
  description: 'Kho video hoạt động sản xuất, chăm sóc nông trại và thu hoạch rau an toàn VietGAP tại Hợp tác xã Túy Loan Đà Nẵng.',
};

async function getData() {
  try {
    const payload = await getPayload({ config: configPromise });

    const [videosResult, channelsResult] = await Promise.all([
      payload.find({
        collection: 'videos',
        sort: '-publishedDate',
        limit: 100,
        depth: 1,
      }),
      payload.find({
        collection: 'video-channels',
        sort: 'name',
        limit: 50,
      }),
    ]);

    return {
      videos: videosResult.docs,
      channels: channelsResult.docs,
    };
  } catch (error) {
    console.error('Error fetching video library data:', error);
    return { videos: [], channels: [] };
  }
}

export default async function VideoPage() {
  const { videos, channels } = await getData();
  return <VideoLibraryClient videos={videos} channels={channels} />;
}

'use client';

import { useEffect } from 'react';

export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    // Chỉ đếm 1 lần mỗi session
    const key = `viewed_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    fetch('/api/view-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  return null;
}

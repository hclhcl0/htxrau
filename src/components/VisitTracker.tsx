'use client';

import { useEffect } from 'react';

export function VisitTracker() {
  useEffect(() => {
    // Chỉ track 1 lần mỗi session (không đếm F5)
    if (sessionStorage.getItem('visit_tracked')) return;
    sessionStorage.setItem('visit_tracked', '1');

    fetch('/api/track-visit', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { Users, Eye } from 'lucide-react';

export function VisitorCounter() {
  const [stats, setStats] = useState<{ totalVisits: number; todayVisits: number } | null>(null);

  useEffect(() => {
    fetch('/api/track-visit')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const fmt = (n: number) => n.toLocaleString('vi-VN');

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 mt-3">
      <span className="flex items-center gap-1.5">
        <Eye size={12} className="text-white/50" />
        Hôm nay: <strong className="text-white/90 ml-0.5">{fmt(stats.todayVisits)}</strong> lượt
      </span>
      <span className="text-white/30">|</span>
      <span className="flex items-center gap-1.5">
        <Users size={12} className="text-white/50" />
        Tổng: <strong className="text-white/90 ml-0.5">{fmt(stats.totalVisits)}</strong> lượt
      </span>
    </div>
  );
}

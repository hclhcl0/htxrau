'use client';

import { useEffect, useState } from 'react';
import { Users, Eye, CalendarDays } from 'lucide-react';

interface Stats {
  totalVisits: number;
  todayVisits: number;
  monthVisits: number;
}

export function VisitorCounter() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/track-visit')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const fmt = (n: number) => n.toLocaleString('vi-VN');

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60 mt-2">
      <span className="flex items-center gap-1.5">
        <Eye size={12} className="text-white/50" />
        Hôm nay: <strong className="text-white/90 ml-0.5">{fmt(stats.todayVisits)}</strong>
      </span>
      <span className="text-white/25">|</span>
      <span className="flex items-center gap-1.5">
        <CalendarDays size={12} className="text-white/50" />
        Tháng này: <strong className="text-white/90 ml-0.5">{fmt(stats.monthVisits)}</strong>
      </span>
      <span className="text-white/25">|</span>
      <span className="flex items-center gap-1.5">
        <Users size={12} className="text-white/50" />
        Tổng: <strong className="text-white/90 ml-0.5">{fmt(stats.totalVisits)}</strong>
      </span>
    </div>
  );
}

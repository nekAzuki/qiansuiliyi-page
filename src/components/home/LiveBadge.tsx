'use client';

import { useState, useEffect } from 'react';

interface LiveStatus {
  isLive: boolean;
  title: string;
  cover: string;
  url: string;
  online: number;
}

const LIVE_ROOM_URL = 'https://live.bilibili.com/27619512';

export default function LiveBadge() {
  const [status, setStatus] = useState<LiveStatus | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/live')
        .then((res) => res.json() as Promise<{ success: boolean; data: LiveStatus }>)
        .then((json) => {
          if (json.success && json.data) {
            setStatus(json.data);
          }
        })
        .catch(() => {});
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const isLive = status.isLive;

  return (
    <a
      href={isLive ? status.url : LIVE_ROOM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`card px-3 py-2.5 flex items-center gap-3 transition-all group ${
        isLive ? 'hover:shadow-md' : 'opacity-60'
      }`}
    >
      {/* Status indicator */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {isLive ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-500">直播中</span>
          </>
        ) : (
          <>
            <span className="inline-flex rounded-full h-2.5 w-2.5 bg-gray-300" />
            <span className="text-xs font-bold text-gray-400">未开播</span>
          </>
        )}
      </div>

      {/* Stream info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-colors ${
          isLive ? 'text-gray-800 group-hover:text-primary-600' : 'text-gray-400'
        }`}>
          {isLive ? status.title : '点击前往直播间'}
        </p>
      </div>

      {/* Online count */}
      {isLive && status.online > 0 && (
        <span className="flex-shrink-0 text-xs text-gray-400">
          {status.online} 人
        </span>
      )}
    </a>
  );
}

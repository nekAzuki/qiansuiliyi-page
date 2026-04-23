'use client';

import { useState, useEffect } from 'react';

interface ProfileHeaderProps {
  songCount: number;
  tagline?: string;
}

interface LiveStatus {
  isLive: boolean;
  title: string;
  url: string;
  online: number;
}

const LIVE_ROOM_URL = 'https://live.bilibili.com/27619512';

export default function ProfileHeader({ songCount, tagline }: ProfileHeaderProps) {
  const [live, setLive] = useState<LiveStatus | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/live')
        .then((res) => res.json() as Promise<{ success: boolean; data: LiveStatus }>)
        .then((json) => {
          if (json.success && json.data) {
            setLive(json.data);
          }
        })
        .catch(() => {});
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const isLive = live?.isLive ?? false;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-primary-100/50">
      {/* Subtle purple accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300" />

      <div className="relative flex items-center gap-4 p-6 pt-5">
        {/* Avatar with link */}
        <a
          href="https://space.bilibili.com/279148275"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 relative rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <img
            src="/avatar.jpg"
            alt="千穗梨衣_lily"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-300/60 ring-offset-2 ring-offset-white/50"
          />
          <div className="absolute inset-0 rounded-full bg-gray-300/0 hover:bg-gray-300/30 transition-colors duration-200" />
        </a>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold truncate text-primary-700">千穗梨衣_lily</h1>
            {/* Live status — temporarily hidden due to Cloudflare-to-Bilibili API bot detection */}
            {/* {live && (
              <a
                href={isLive ? live.url : LIVE_ROOM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs transition-colors ${
                  isLive
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {isLive ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    直播中
                  </>
                ) : (
                  <>
                    <span className="inline-flex rounded-full h-2 w-2 bg-gray-300" />
                    未开播
                  </>
                )}
              </a>
            )} */}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{tagline || '她的歌单'}</p>
          <p className="text-primary-400 text-xs mt-1">共 {songCount} 首歌曲</p>
        </div>
      </div>
    </div>
  );
}

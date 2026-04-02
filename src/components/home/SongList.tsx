'use client';

import { useEffect, useRef } from 'react';
import { Song } from '@/types';
import SongCard from './SongCard';

interface SongListProps {
  songs: Song[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onCopy: (songName: string) => void;
}

function SkeletonCard() {
  return (
    <div className="card p-3 flex gap-3 animate-pulse">
      <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-primary-100" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-primary-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex gap-1.5 mt-2">
          <div className="h-4 w-10 bg-primary-50 rounded-full" />
          <div className="h-4 w-12 bg-gray-50 rounded-full" />
        </div>
        <div className="flex justify-between mt-2">
          <div className="h-5 w-12 bg-gray-50 rounded-lg" />
          <div className="h-3 w-16 bg-gray-50 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function SongList({ songs, loading, hasMore, onLoadMore, onCopy }: SongListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (songs.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-gray-300">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm">没有找到匹配的歌曲</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} onCopy={onCopy} />
      ))}

      {loading && songs.length === 0 && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!loading && !hasMore && songs.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-6">没有更多歌曲了</p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

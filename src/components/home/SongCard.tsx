'use client';

import { useState } from 'react';
import { Song } from '@/types';
import LikeButton from './LikeButton';

interface SongCardProps {
  song: Song;
  onCopy: (songName: string) => void;
}

export default function SongCard({ song, onCopy }: SongCardProps) {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
  };

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(song.song_name);
      onCopy(song.song_name);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = song.song_name;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onCopy(song.song_name);
    }
  };

  const tags = song.tags ? song.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const addedDate = new Date(song.created_at).toLocaleDateString('zh-CN');

  return (
    <div
      onClick={(e) => { handlePress(); handleCopyName(); }}
      onPointerDown={handlePress}
      className={`card p-3 flex gap-3 cursor-pointer transition-transform ${pressed ? 'scale-[0.98]' : ''}`}
      title="点击复制歌曲名"
    >
      {/* Album cover */}
      <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.song_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/70">
              <path
                d="M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-sm truncate">
            {song.song_name}
          </p>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{song.artist}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {song.language && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 text-primary-700">
              {song.language}
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <LikeButton songId={song.id} initialCount={song.likes} />
          </div>
          <span className="text-[10px] text-gray-400">{addedDate}</span>
        </div>
      </div>
    </div>
  );
}

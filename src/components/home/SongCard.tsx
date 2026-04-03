'use client';

import { useState } from 'react';
import { Song } from '@/types';
import LikeButton from './LikeButton';

interface SongCardProps {
  song: Song;
  onCopy: (songName: string) => void;
  highlight?: boolean;
}

export default function SongCard({ song, onCopy, highlight }: SongCardProps) {
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

  let tags: string[] = [];
  if (song.tags) {
    try {
      const parsed = JSON.parse(song.tags);
      tags = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      tags = song.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  return (
    <div
      onClick={(e) => { handlePress(); handleCopyName(); }}
      onPointerDown={handlePress}
      id={`song-${song.id}`}
      className={`card px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-all duration-200 min-h-[4.5rem] ${pressed ? 'scale-[0.98]' : ''} ${highlight ? 'ring-2 ring-primary-400 scale-[1.02] shadow-lg shadow-primary-200/50' : ''}`}
    >
      {/* Album cover */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.song_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/70">
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

      {/* Song name + artist */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{song.song_name}</p>
        <p className="text-gray-500 text-xs truncate">{song.artist}</p>
      </div>

      {/* Right side: tags, date, like */}
      <div className="flex-shrink-0 flex flex-col items-end justify-between self-stretch">
        {/* Tags + language row */}
        <div className="flex items-center gap-1 min-h-[22px]">
          {song.language && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary-500/15 text-primary-700 border border-primary-300/40">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {song.language}
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-300/40"
            >
              <span className="text-xs font-bold leading-none">#</span>
              {tag}
            </span>
          ))}
        </div>
        {/* Date + like row */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{new Date(song.created_at).toLocaleDateString('zh-CN')}</span>
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <LikeButton songId={song.id} initialCount={song.likes} />
          </div>
        </div>
      </div>
    </div>
  );
}

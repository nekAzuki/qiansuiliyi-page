'use client';

import { useLike } from '@/hooks/useLike';

interface LikeButtonProps {
  songId: number;
  initialCount: number;
  onLiked?: () => void;
}

export default function LikeButton({ songId, initialCount, onLiked }: LikeButtonProps) {
  const { count, liked, toggle } = useLike(songId, initialCount);

  const handleClick = async () => {
    await toggle();
    if (!liked && onLiked) {
      onLiked();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
        transition-colors duration-150 select-none cursor-pointer
        ${
          liked
            ? 'text-pink-500 bg-pink-50 hover:bg-pink-100'
            : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
        }
      `}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill={liked ? 'currentColor' : 'none'}>
        <path
          d="M7 12.5S1.5 9.5 1.5 5.5C1.5 3.5 3 2 4.75 2C5.93 2 6.9 2.63 7 3.25C7.1 2.63 8.07 2 9.25 2C11 2 12.5 3.5 12.5 5.5C12.5 9.5 7 12.5 7 12.5Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}

import { useState, useCallback } from 'react';

export function useLike(songId: number, initialCount: number) {
  const storageKey = `liked_${songId}`;

  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === '1';
  });

  const [count, setCount] = useState(initialCount);

  const toggle = useCallback(async () => {
    if (liked) return;

    // Optimistic update
    setLiked(true);
    setCount((c) => c + 1);
    localStorage.setItem(storageKey, '1');

    try {
      const res = await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
      });

      if (!res.ok) {
        // Revert on failure
        setLiked(false);
        setCount((c) => c - 1);
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Revert on error
      setLiked(false);
      setCount((c) => c - 1);
      localStorage.removeItem(storageKey);
    }
  }, [liked, songId, storageKey]);

  return { count, liked, toggle };
}

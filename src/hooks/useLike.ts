import { useState, useCallback, useEffect } from 'react';

export function useLike(songId: number, initialCount: number) {
  const storageKey = `liked_${songId}`;

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === '1');
  }, [storageKey]);

  const toggle = useCallback(async () => {
    if (liked) {
      // Unlike: optimistic update
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      localStorage.removeItem(storageKey);

      try {
        const res = await fetch(`/api/songs/${songId}/like`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          setLiked(true);
          setCount((c) => c + 1);
          localStorage.setItem(storageKey, '1');
        }
      } catch {
        setLiked(true);
        setCount((c) => c + 1);
        localStorage.setItem(storageKey, '1');
      }
    } else {
      // Like: optimistic update
      setLiked(true);
      setCount((c) => c + 1);
      localStorage.setItem(storageKey, '1');

      try {
        const res = await fetch(`/api/songs/${songId}/like`, {
          method: 'POST',
        });

        if (!res.ok) {
          setLiked(false);
          setCount((c) => c - 1);
          localStorage.removeItem(storageKey);
        }
      } catch {
        setLiked(false);
        setCount((c) => c - 1);
        localStorage.removeItem(storageKey);
      }
    }
  }, [liked, songId, storageKey]);

  return { count, liked, toggle };
}

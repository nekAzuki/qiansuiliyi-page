import { useState, useEffect, useCallback, useRef } from 'react';
import { Song, SongListResponse, ApiResponse } from '@/types';

interface UseSongsParams {
  query: string;
  language: string | null;
  tags: string[];
}

export function useSongs({ query, language, tags }: UseSongsParams) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  // Reset when params change
  useEffect(() => {
    setSongs([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, [query, language, tags]);

  const fetchMore = useCallback(async () => {
    if (loading) return;

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (language) params.set('language', language);
      if (tags.length > 0) params.set('tags', tags.join(','));
      if (nextCursor !== undefined) params.set('cursor', String(nextCursor));

      const res = await fetch(`/api/songs?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('请求失败');

      const json: ApiResponse<SongListResponse> = await res.json();

      if (json.success && json.data) {
        setSongs((prev) =>
          nextCursor === undefined ? json.data!.songs : [...prev, ...json.data!.songs]
        );
        setHasMore(json.data.hasMore);
        setNextCursor(json.data.nextCursor);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('获取歌曲失败:', err);
    } finally {
      setLoading(false);
    }
  }, [query, language, tags, nextCursor, loading]);

  // Auto-fetch on param change
  useEffect(() => {
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, language, tags]);

  return { songs, loading, hasMore, fetchMore };
}

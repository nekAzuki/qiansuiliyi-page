import { useState, useEffect, useCallback, useRef } from 'react';
import { Song, SongListResponse, ApiResponse } from '@/types';

interface UseSongsParams {
  query: string;
  language: string | null;
  tags: string[];
}

export function useSongs({ query, language, tags }: UseSongsParams) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const paramsRef = useRef({ query, language, tags });

  // Track param changes and refetch
  useEffect(() => {
    paramsRef.current = { query, language, tags };

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setNextCursor(undefined);
    setHasMore(true);

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (language) params.set('language', language);
    if (tags.length > 0) params.set('tags', tags.join(','));

    fetch(`/api/songs?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('请求失败');
        return res.json() as Promise<ApiResponse<SongListResponse>>;
      })
      .then((json) => {
        if (json.success && json.data) {
          setSongs(json.data.songs);
          setHasMore(json.data.hasMore);
          setNextCursor(json.data.nextCursor);
          setTotal(json.data.total);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('获取歌曲失败:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, language, tags]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore || nextCursor === undefined) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const { query: q, language: lang, tags: t } = paramsRef.current;
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (lang) params.set('language', lang);
      if (t.length > 0) params.set('tags', t.join(','));
      params.set('cursor', String(nextCursor));

      const res = await fetch(`/api/songs?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('请求失败');

      const json: ApiResponse<SongListResponse> = await res.json();

      if (json.success && json.data) {
        setSongs((prev) => [...prev, ...json.data!.songs]);
        setHasMore(json.data.hasMore);
        setNextCursor(json.data.nextCursor);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('获取歌曲失败:', err);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [loading, hasMore, nextCursor]);

  return { songs, loading, hasMore, total, fetchMore };
}

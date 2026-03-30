import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types';

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTags() {
      try {
        const res = await fetch('/api/tags');
        if (!res.ok) return;
        const json: ApiResponse<string[]> = await res.json();
        if (!cancelled && json.success && json.data) {
          setTags(json.data);
        }
      } catch {
        // Silently fail
      }
    }

    fetchTags();
    return () => {
      cancelled = true;
    };
  }, []);

  return tags;
}

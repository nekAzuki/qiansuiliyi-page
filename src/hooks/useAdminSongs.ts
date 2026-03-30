'use client';

import { useState, useCallback, useMemo } from 'react';
import { Song, SongInput, SongUpdate, BatchSaveRequest, ApiResponse } from '@/types';

type ChangeType = 'added' | 'modified' | 'deleted';

let tempIdCounter = -1;

function getNextTempId() {
  return tempIdCounter--;
}

function makeEmptySong(): Song {
  const id = getNextTempId();
  return {
    id,
    song_name: '',
    artist: '',
    language: '',
    tags: '',
    cover_url: '',
    notes: '',
    sort_weight: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    likes: 0,
    pinyin_name: '',
    pinyin_artist: '',
    initials_name: '',
    initials_artist: '',
  };
}

export function useAdminSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [changes, setChanges] = useState<Map<number, ChangeType>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/songs?limit=9999', {
        headers: getAuthHeaders(),
      });
      const json: ApiResponse<{ songs: Song[] }> = await res.json();
      if (json.success && json.data) {
        setSongs(json.data.songs);
      }
    } catch {
      console.error('获取歌曲列表失败');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Fetch on mount
  useState(() => {
    fetchSongs();
  });

  const addSong = useCallback(() => {
    const newSong = makeEmptySong();
    setSongs((prev) => [newSong, ...prev]);
    setChanges((prev) => {
      const next = new Map(prev);
      next.set(newSong.id, 'added');
      return next;
    });
  }, []);

  const updateSong = useCallback((id: number, field: string, value: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    setChanges((prev) => {
      const next = new Map(prev);
      // Don't override 'added' with 'modified'
      if (!next.has(id) || next.get(id) !== 'added') {
        next.set(id, 'modified');
      }
      return next;
    });
  }, []);

  const deleteSongs = useCallback((ids: number[]) => {
    setChanges((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => {
        if (next.get(id) === 'added') {
          // Remove newly added songs entirely
          next.delete(id);
          setSongs((prev) => prev.filter((s) => s.id !== id));
        } else {
          next.set(id, 'deleted');
        }
      });
      return next;
    });
  }, []);

  const unsavedCount = useMemo(() => changes.size, [changes]);

  const detectDuplicates = useCallback(
    (name: string, artist: string, excludeId?: number) => {
      if (!name.trim()) return null;
      const match = songs.find(
        (s) =>
          s.id !== excludeId &&
          s.song_name.toLowerCase() === name.toLowerCase() &&
          s.artist.toLowerCase() === artist.toLowerCase()
      );
      return match ? { song_name: match.song_name, artist: match.artist } : null;
    },
    [songs]
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (changes.size === 0) return true;
    setSaving(true);

    try {
      const added: SongInput[] = [];
      const updated: SongUpdate[] = [];
      const deleted: number[] = [];

      changes.forEach((type, id) => {
        const song = songs.find((s) => s.id === id);
        if (!song) return;

        if (type === 'added') {
          added.push({
            song_name: song.song_name,
            artist: song.artist,
            language: song.language,
            tags: song.tags ? song.tags.split(',').map((t) => t.trim()) : [],
            cover_url: song.cover_url,
            notes: song.notes,
            sort_weight: song.sort_weight,
          });
        } else if (type === 'modified') {
          updated.push({
            id: song.id,
            song_name: song.song_name,
            artist: song.artist,
            language: song.language,
            tags: song.tags ? song.tags.split(',').map((t) => t.trim()) : [],
            cover_url: song.cover_url,
            notes: song.notes,
            sort_weight: song.sort_weight,
          });
        } else if (type === 'deleted') {
          deleted.push(id);
        }
      });

      const body: BatchSaveRequest = { added, updated, deleted };

      const res = await fetch('/api/songs/batch', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setChanges(new Map());
        await fetchSongs();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [changes, songs, getAuthHeaders, fetchSongs]);

  const importSongs = useCallback((inputs: SongInput[]) => {
    const newSongs = inputs.map((input) => {
      const id = getNextTempId();
      const song: Song = {
        id,
        song_name: input.song_name,
        artist: input.artist,
        language: input.language || '',
        tags: input.tags ? input.tags.join(',') : '',
        cover_url: input.cover_url || '',
        notes: input.notes || '',
        sort_weight: input.sort_weight || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        pinyin_name: '',
        pinyin_artist: '',
        initials_name: '',
        initials_artist: '',
      };
      return song;
    });

    setSongs((prev) => [...newSongs, ...prev]);
    setChanges((prev) => {
      const next = new Map(prev);
      newSongs.forEach((s) => next.set(s.id, 'added'));
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    setChanges(new Map());
    fetchSongs();
  }, [fetchSongs]);

  return {
    songs,
    changes,
    addSong,
    updateSong,
    deleteSongs,
    save,
    importSongs,
    loading,
    saving,
    unsavedCount,
    detectDuplicates,
    refresh,
  };
}

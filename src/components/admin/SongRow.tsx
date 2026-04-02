'use client';

import { useState, useRef, useEffect } from 'react';
import { Song } from '@/types';
import { LANGUAGES } from '@/lib/constants';
import DuplicateWarning from './DuplicateWarning';
import TagInput from './TagInput';

interface SearchResult {
  name: string;
  artist: string;
  coverUrl: string;
}

interface SongRowProps {
  song: Song;
  isNew: boolean;
  isModified: boolean;
  isDeleted: boolean;
  isSelected: boolean;
  duplicateOf: { song_name: string; artist: string } | null;
  onUpdate: (field: string, value: string) => void;
  onSelect: (selected: boolean) => void;
}

export default function SongRow({
  song,
  isNew,
  isModified,
  isDeleted,
  isSelected,
  duplicateOf,
  onUpdate,
  onSelect,
}: SongRowProps) {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const rowBg = isDeleted
    ? 'bg-red-50'
    : isNew
    ? 'bg-green-50'
    : isModified
    ? 'bg-yellow-50'
    : 'bg-white';

  const textStyle = isDeleted ? 'line-through text-gray-400' : '';

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSongNameChange = (value: string) => {
    onUpdate('song_name', value);

    // Debounced search
    clearTimeout(searchTimeout.current);
    if (value.trim().length >= 2) {
      searchTimeout.current = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await fetch(`/api/songs/search?keyword=${encodeURIComponent(value.trim())}`);
          const json = await res.json();
          if (json.success && json.data) {
            setSuggestions(json.data);
            setShowSuggestions(json.data.length > 0);
          }
        } catch {
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      }, 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const detectLanguage = (songName: string): string => {
    const hasChinese = /[\u4e00-\u9fff]/.test(songName);
    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(songName);
    const hasKorean = /[\uac00-\ud7af]/.test(songName);

    if (hasJapanese) return '日语';
    if (hasKorean) return '韩语';
    if (hasChinese) return '国语';
    return '英语';
  };

  const selectSuggestion = (result: SearchResult) => {
    onUpdate('song_name', result.name);
    onUpdate('artist', result.artist);
    onUpdate('language', detectLanguage(result.name));
    if (result.coverUrl) {
      onUpdate('cover_url', result.coverUrl);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <>
      <tr className={`${rowBg} border-b border-gray-100 hover:bg-gray-50/50 transition-colors`}>
        <td className="px-3 py-2 w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300 text-primary-500 focus:ring-primary-200"
          />
        </td>
        <td className="px-3 py-2 relative" ref={suggestionsRef}>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={song.song_name}
              onChange={(e) => handleSongNameChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              disabled={isDeleted}
              className={`w-full bg-transparent text-sm border-0 p-0 focus:ring-0 ${textStyle}`}
              placeholder="歌曲名称（输入自动搜索）"
            />
            {searching && (
              <span className="text-xs text-gray-400 flex-shrink-0">搜索中...</span>
            )}
          </div>
          {/* Search suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] text-gray-400 border-b border-gray-100">
                点击选择以自动填充歌手和封面
              </div>
              {suggestions.map((result, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(result)}
                  className="w-full text-left px-3 py-2 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                >
                  {result.coverUrl && (
                    <img
                      src={result.coverUrl}
                      alt=""
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{result.name}</p>
                    <p className="text-xs text-gray-500 truncate">{result.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={song.artist}
            onChange={(e) => onUpdate('artist', e.target.value)}
            disabled={isDeleted}
            className={`w-full bg-transparent text-sm border-0 p-0 focus:ring-0 ${textStyle}`}
            placeholder="歌手"
          />
        </td>
        <td className="px-3 py-2">
          <select
            value={song.language}
            onChange={(e) => onUpdate('language', e.target.value)}
            disabled={isDeleted}
            className={`bg-transparent text-sm border-0 p-0 focus:ring-0 ${textStyle}`}
          >
            <option value="">选择语言</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2">
          <TagInput
            value={song.tags}
            onChange={(val) => onUpdate('tags', val)}
            disabled={isDeleted}
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={song.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            disabled={isDeleted}
            className={`w-full bg-transparent text-sm border-0 p-0 focus:ring-0 ${textStyle}`}
            placeholder="备注"
          />
        </td>
      </tr>
      {duplicateOf && (
        <tr className={rowBg}>
          <td colSpan={6} className="px-3 pb-2">
            <DuplicateWarning
              existingSongName={duplicateOf.song_name}
              existingArtist={duplicateOf.artist}
            />
          </td>
        </tr>
      )}
    </>
  );
}

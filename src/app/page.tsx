'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ProfileHeader from '@/components/home/ProfileHeader';
import SearchBar from '@/components/home/SearchBar';
import FilterBar from '@/components/home/FilterBar';
import SongList from '@/components/home/SongList';
import Toast from '@/components/ui/Toast';
import { useSongs } from '@/hooks/useSongs';
import { useTags } from '@/hooks/useTags';
import { LANGUAGES, SEARCH_DEBOUNCE_MS } from '@/lib/constants';

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [copiedName, setCopiedName] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'alphabet' | 'likes'>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [randomMode, setRandomMode] = useState<'idle' | 'shuffling' | 'result'>('idle');
  const [randomDisplay, setRandomDisplay] = useState<typeof songs>([]);
  const [randomResult, setRandomResult] = useState<typeof songs[0] | null>(null);
  const [searchBarHidden, setSearchBarHidden] = useState(false);
  const [tagline, setTagline] = useState('');
  const searchBarRef = useRef<HTMLDivElement>(null);
  const shuffleCancelledRef = useRef(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json() as Promise<{ success: boolean; data?: Record<string, string> }>)
      .then((json) => {
        if (json.success && json.data?.tagline) {
          setTagline(json.data.tagline);
        }
      })
      .catch(() => {});
  }, []);

  const tags = useTags();
  const { songs, loading, hasMore, fetchMore } = useSongs({
    query,
    language: selectedLanguage,
    tags: selectedTags,
  });

  const sortedSongs = useMemo(() => {
    const sorted = [...songs];
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'alphabet':
        sorted.sort((a, b) => dir * a.song_name.localeCompare(b.song_name, 'zh-CN'));
        break;
      case 'likes':
        sorted.sort((a, b) => dir * (a.likes - b.likes));
        break;
      case 'time':
        sorted.sort((a, b) => dir * a.created_at.localeCompare(b.created_at));
        break;
    }
    return sorted;
  }, [songs, sortBy, sortDir]);

  // Track search bar visibility
  useEffect(() => {
    const el = searchBarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSearchBarHidden(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const handleRandom = useCallback(() => {
    if (sortedSongs.length === 0) return;
    if (randomMode === 'shuffling') return;

    const finalSong = sortedSongs[Math.floor(Math.random() * sortedSongs.length)];
    shuffleCancelledRef.current = false;
    setRandomMode('shuffling');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let count = 0;
    const totalSteps = 20;

    const step = () => {
      if (shuffleCancelledRef.current) return;
      count++;
      if (count < totalSteps) {
        const randomSong = sortedSongs[Math.floor(Math.random() * sortedSongs.length)];
        setRandomDisplay([randomSong]);
        setTimeout(step, 40 + count * 12);
      } else {
        setRandomDisplay([finalSong]);
        setRandomResult(finalSong);
        setRandomMode('result');
        navigator.clipboard.writeText(finalSong.song_name).catch(() => {});
        setCopiedName(finalSong.song_name);
        setToastVisible(true);
      }
    };

    setRandomDisplay([sortedSongs[Math.floor(Math.random() * sortedSongs.length)]]);
    step();
  }, [sortedSongs, randomMode]);

  const handleCopy = useCallback((songName: string) => {
    setCopiedName(songName);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4 pointer-events-none [&>*]:pointer-events-auto">
      <ProfileHeader songCount={sortedSongs.length} tagline={tagline} />
      <div ref={searchBarRef}>
        <SearchBar value={searchInput} onChange={setSearchInput} onRandom={handleRandom} />
      </div>
      <FilterBar
        languages={[...LANGUAGES]}
        selectedLanguage={selectedLanguage}
        tags={tags}
        selectedTags={selectedTags}
        sortBy={sortBy}
        sortDir={sortDir}
        onLanguageChange={setSelectedLanguage}
        onTagsChange={setSelectedTags}
        onSortChange={(sort, dir) => { setSortBy(sort); setSortDir(dir); }}
      />

      {/* Full list */}
      <div className={`transition-all duration-300 ${randomMode !== 'idle' ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[99999px] opacity-100'}`}>
        <SongList
          songs={sortedSongs}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={fetchMore}
          onCopy={handleCopy}
          highlightId={null}
        />
      </div>

      {/* Random single card */}
      {randomMode !== 'idle' && randomDisplay.length > 0 && (
        <div className="animate-[slideUp_300ms_ease-out] min-h-[120px] flex flex-col items-center justify-center gap-3">
          <div className="w-full">
            <SongList
              songs={randomDisplay}
              loading={false}
              hasMore={false}
              onLoadMore={() => {}}
              onCopy={handleCopy}
              highlightId={randomMode === 'result' ? randomResult?.id : null}
              hideEndMessage
            />
          </div>
          <div className="h-8">
            {randomMode === 'result' && (
              <button
                onClick={() => { shuffleCancelledRef.current = true; setRandomMode('idle'); setRandomResult(null); setRandomDisplay([]); }}
                className="text-sm text-primary-500 hover:text-primary-700 transition-colors cursor-pointer animate-pulse"
              >
                点击此处返回完整列表
              </button>
            )}
          </div>
        </div>
      )}
      {/* Fixed bottom search bar when scrolled past */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
          searchBarHidden ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-lg mx-auto px-4 py-2">
          <SearchBar value={searchInput} onChange={setSearchInput} onRandom={handleRandom} />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-4">
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
          <img src="/coding.gif" alt="" className="w-5 h-5 object-contain" />
          <span>Vibe coded in</span>
          <img src="/space_needle.png" alt="" className="w-4 h-4 object-contain opacity-60" />
          <span>Seattle by</span>
          <a
            href="https://space.bilibili.com/239998"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-600 transition-colors"
          >
            Nekopara_Azuki
          </a>
        </div>
      </footer>

      <Toast message="已复制歌曲名：" highlight={copiedName} visible={toastVisible} onHide={hideToast} />
    </main>
  );
}

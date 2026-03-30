'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

  const tags = useTags();
  const { songs, loading, hasMore, fetchMore } = useSongs({
    query,
    language: selectedLanguage,
    tags: selectedTags,
  });

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setQuery(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const handleCopy = useCallback(() => {
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <ProfileHeader songCount={songs.length} />
      <SearchBar value={searchInput} onChange={setSearchInput} />
      <FilterBar
        languages={[...LANGUAGES]}
        selectedLanguage={selectedLanguage}
        tags={tags}
        selectedTags={selectedTags}
        onLanguageChange={setSelectedLanguage}
        onTagsChange={setSelectedTags}
      />
      <SongList
        songs={songs}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={fetchMore}
        onCopy={handleCopy}
      />
      <Toast message="已复制歌曲名" visible={toastVisible} onHide={hideToast} />
    </main>
  );
}

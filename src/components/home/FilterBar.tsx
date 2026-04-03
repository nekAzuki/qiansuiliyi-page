export type SortOption = 'time' | 'alphabet' | 'likes';
export type SortDirection = 'asc' | 'desc';

interface FilterBarProps {
  languages: string[];
  selectedLanguage: string | null;
  tags: string[];
  selectedTags: string[];
  sortBy: SortOption;
  sortDir: SortDirection;
  onLanguageChange: (language: string | null) => void;
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sort: SortOption, dir: SortDirection) => void;
}

export default function FilterBar({
  languages,
  selectedLanguage,
  tags,
  selectedTags,
  sortBy,
  sortDir,
  onLanguageChange,
  onTagsChange,
  onSortChange,
}: FilterBarProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Language filters */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <span className="text-sm font-medium text-primary-700 whitespace-nowrap flex-shrink-0">语言</span>
        <button
          onClick={() => onLanguageChange(null)}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-150 select-none ${
            selectedLanguage === null
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white/60 text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
          }`}
        >
          全部
        </button>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(selectedLanguage === lang ? null : lang)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-150 select-none ${
              selectedLanguage === lang
                ? 'bg-primary-500/90 text-white shadow-sm'
                : 'bg-primary-500/10 text-primary-700 border border-primary-300/40 hover:bg-primary-500/20'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {lang}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <span className="text-sm font-medium text-amber-700 whitespace-nowrap flex-shrink-0">标签</span>
          <button
            onClick={clearAllTags}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-150 select-none ${
              selectedTags.length === 0
                ? 'bg-amber-500/90 text-white shadow-sm'
                : 'bg-white/60 text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-150 select-none ${
                selectedTags.includes(tag)
                  ? 'bg-amber-500/90 text-white shadow-sm'
                  : 'bg-amber-500/10 text-amber-700 border border-amber-300/40 hover:bg-amber-500/20'
              }`}
            >
              <span className="text-xs font-bold leading-none">#</span>
              {tag}
            </button>
          ))}
        </div>
      )}
      {/* Sort options */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap flex-shrink-0">排序</span>
        {([
          ['time', '添加时间'],
          ['alphabet', '歌名'],
          ['likes', '喜欢数'],
        ] as const).map(([key, label]) => {
          const isActive = sortBy === key;
          const handleClick = () => {
            if (isActive) {
              onSortChange(key, sortDir === 'desc' ? 'asc' : 'desc');
            } else {
              onSortChange(key, key === 'alphabet' ? 'asc' : 'desc');
            }
          };
          return (
            <button
              key={key}
              onClick={handleClick}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors duration-150 select-none ${
                isActive
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'bg-white/60 text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {label}
              {isActive && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {sortDir === 'asc' ? (
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  ) : (
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

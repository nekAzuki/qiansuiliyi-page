import Tag from '@/components/ui/Tag';

interface FilterBarProps {
  languages: string[];
  selectedLanguage: string | null;
  tags: string[];
  selectedTags: string[];
  onLanguageChange: (language: string | null) => void;
  onTagsChange: (tags: string[]) => void;
}

export default function FilterBar({
  languages,
  selectedLanguage,
  tags,
  selectedTags,
  onLanguageChange,
  onTagsChange,
}: FilterBarProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const hasAnyFilter = selectedLanguage !== null || selectedTags.length > 0;

  const clearAll = () => {
    onLanguageChange(null);
    onTagsChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Language filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Tag
          label="全部"
          active={!hasAnyFilter}
          onClick={clearAll}
        />
        {languages.map((lang) => (
          <Tag
            key={lang}
            label={lang}
            active={selectedLanguage === lang}
            onClick={() =>
              onLanguageChange(selectedLanguage === lang ? null : lang)
            }
          />
        ))}
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              active={selectedTags.includes(tag)}
              onClick={() => handleTagToggle(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

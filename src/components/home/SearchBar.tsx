interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onRandom?: () => void;
}

export default function SearchBar({ value, onChange, onRandom }: SearchBarProps) {
  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M13.5 13.5L17 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索歌曲名或歌手（支持拼音）"
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-8 py-2.5 text-sm
            placeholder:text-gray-400
            focus:border-primary-300 focus:ring-2 focus:ring-primary-100
            transition-colors duration-150"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
      {onRandom && (
        <button
          onClick={onRandom}
          title="随机选一首"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50 active:scale-95 transition-all duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5" />
            <path d="M4 20L21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
          </svg>
        </button>
      )}
    </div>
  );
}

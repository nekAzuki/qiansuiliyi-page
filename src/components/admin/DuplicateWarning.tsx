interface DuplicateWarningProps {
  existingSongName: string;
  existingArtist: string;
}

export default function DuplicateWarning({
  existingSongName,
  existingArtist,
}: DuplicateWarningProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
        <path
          d="M7 1L13 12H1L7 1Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span>
        与已有歌曲重复：{existingSongName} - {existingArtist}
      </span>
    </div>
  );
}

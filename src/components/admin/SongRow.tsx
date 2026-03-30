'use client';

import { Song } from '@/types';
import { LANGUAGES } from '@/lib/constants';
import DuplicateWarning from './DuplicateWarning';

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
  const rowBg = isDeleted
    ? 'bg-red-50'
    : isNew
    ? 'bg-green-50'
    : isModified
    ? 'bg-yellow-50'
    : 'bg-white';

  const textStyle = isDeleted ? 'line-through text-gray-400' : '';

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
        <td className="px-3 py-2">
          <input
            type="text"
            value={song.song_name}
            onChange={(e) => onUpdate('song_name', e.target.value)}
            disabled={isDeleted}
            className={`w-full bg-transparent text-sm border-0 p-0 focus:ring-0 ${textStyle}`}
            placeholder="歌曲名称"
          />
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
          <input
            type="text"
            value={song.tags}
            onChange={(e) => onUpdate('tags', e.target.value)}
            disabled={isDeleted}
            className={`w-full bg-transparent text-sm border-0 p-0 focus:ring-0 ${textStyle}`}
            placeholder="标签（逗号分隔）"
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

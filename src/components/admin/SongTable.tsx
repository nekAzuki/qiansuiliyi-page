'use client';

import { Song } from '@/types';
import SongRow from './SongRow';

type ChangeType = 'added' | 'modified' | 'deleted';

interface SongTableProps {
  songs: Song[];
  pendingChanges: Map<number, ChangeType>;
  onUpdate: (id: number, field: string, value: string) => void;
  onDelete: (id: number) => void;
  onSelect: (id: number, selected: boolean) => void;
  selectedIds: Set<number>;
  detectDuplicates: (
    name: string,
    artist: string,
    excludeId?: number
  ) => { song_name: string; artist: string } | null;
}

export default function SongTable({
  songs,
  pendingChanges,
  onUpdate,
  onSelect,
  selectedIds,
  detectDuplicates,
}: SongTableProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        暂无歌曲，点击"添加歌曲"开始
      </div>
    );
  }

  return (
    <div className="card overflow-visible">
      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '40px' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="px-3 py-2.5 text-left">
              <span className="sr-only">选择</span>
            </th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">
              歌曲名称
            </th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">
              歌手
            </th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">
              语言
            </th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">
              分类标签
            </th>
            <th className="px-3 py-2.5 text-left font-medium text-gray-600">
              备注
            </th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => {
            const changeType = pendingChanges.get(song.id);
            const dup = detectDuplicates(song.song_name, song.artist, song.id);
            return (
              <SongRow
                key={song.id}
                song={song}
                isNew={changeType === 'added'}
                isModified={changeType === 'modified'}
                isDeleted={changeType === 'deleted'}
                isSelected={selectedIds.has(song.id)}
                duplicateOf={dup}
                onUpdate={(field, value) => onUpdate(song.id, field, value)}
                onSelect={(selected) => onSelect(song.id, selected)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

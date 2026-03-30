'use client';

import { useState, useMemo } from 'react';
import { Song, SongInput } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ImportPreviewProps {
  open: boolean;
  songs: SongInput[];
  existingSongs: Song[];
  onConfirm: (selected: SongInput[]) => void;
  onClose: () => void;
}

export default function ImportPreview({
  open,
  songs,
  existingSongs,
  onConfirm,
  onClose,
}: ImportPreviewProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set(songs.map((_, i) => i)));

  // Reset checked when songs change
  useMemo(() => {
    setChecked(new Set(songs.map((_, i) => i)));
  }, [songs]);

  const duplicates = useMemo(() => {
    const dupeMap = new Map<number, Song>();
    songs.forEach((s, i) => {
      const existing = existingSongs.find(
        (e) =>
          e.song_name.toLowerCase() === s.song_name.toLowerCase() &&
          e.artist.toLowerCase() === s.artist.toLowerCase()
      );
      if (existing) dupeMap.set(i, existing);
    });
    return dupeMap;
  }, [songs, existingSongs]);

  const toggleRow = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = songs.filter((_, i) => checked.has(i));
    onConfirm(selected);
  };

  return (
    <Modal open={open} onClose={onClose} title="导入预览">
      {songs.length === 0 ? (
        <p className="text-center text-gray-400 py-4 text-sm">没有可导入的数据</p>
      ) : (
        <>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-2 text-left w-8"></th>
                  <th className="py-2 px-2 text-left font-medium text-gray-600">歌曲名称</th>
                  <th className="py-2 px-2 text-left font-medium text-gray-600">歌手</th>
                  <th className="py-2 px-2 text-left font-medium text-gray-600">语言</th>
                  <th className="py-2 px-2 text-left font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, i) => {
                  const isDupe = duplicates.has(i);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-gray-50 ${isDupe ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="py-1.5 pr-2">
                        <input
                          type="checkbox"
                          checked={checked.has(i)}
                          onChange={() => toggleRow(i)}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-200"
                        />
                      </td>
                      <td className="py-1.5 px-2">{song.song_name}</td>
                      <td className="py-1.5 px-2">{song.artist}</td>
                      <td className="py-1.5 px-2">{song.language}</td>
                      <td className="py-1.5 px-2">
                        {isDupe ? (
                          <span className="text-yellow-600">重复</span>
                        ) : (
                          <span className="text-green-600">新增</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={checked.size === 0}>
              确认导入({checked.size})
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

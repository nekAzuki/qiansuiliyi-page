'use client';

import { useState, useCallback, useRef } from 'react';
import TableToolbar from '@/components/admin/TableToolbar';
import SongTable from '@/components/admin/SongTable';
import ImportPreview from '@/components/admin/ImportPreview';
import VersionHistory from '@/components/admin/VersionHistory';
import Toast from '@/components/ui/Toast';
import { useAdminSongs } from '@/hooks/useAdminSongs';
import { SongInput } from '@/types';

export default function AdminPage() {
  const {
    songs,
    changes,
    addSong,
    updateSong,
    deleteSongs,
    save,
    importSongs,
    loading,
    saving,
    unsavedCount,
    detectDuplicates,
    refresh,
  } = useAdminSongs();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const lastClickedRef = useRef<number | null>(null);
  const songsRef = useRef(songs);
  songsRef.current = songs;
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState<SongInput[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const handleSelect = useCallback((id: number, selected: boolean, shiftKey?: boolean) => {
    const currentSongs = songsRef.current;
    const lastClicked = lastClickedRef.current;
    lastClickedRef.current = id;

    if (shiftKey && lastClicked !== null) {
      const lastIdx = currentSongs.findIndex((s) => s.id === lastClicked);
      const curIdx = currentSongs.findIndex((s) => s.id === id);
      if (lastIdx !== -1 && curIdx !== -1) {
        const start = Math.min(lastIdx, curIdx);
        const end = Math.max(lastIdx, curIdx);
        const rangeIds = currentSongs.slice(start, end + 1).map((s) => s.id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((rid) => next.add(rid));
          return next;
        });
        return;
      }
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === songs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(songs.map((s) => s.id)));
    }
  }, [songs, selectedIds.size]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    deleteSongs([...selectedIds]);
    setSelectedIds(new Set());
  }, [selectedIds, deleteSongs]);

  const handleSave = useCallback(async () => {
    const ok = await save();
    if (ok) {
      showToast('保存成功');
    } else {
      showToast('保存失败，请重试');
    }
  }, [save, showToast]);

  const handleImportFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map((h) => h.trim());
        const nameIdx = headers.findIndex((h) => h === '歌曲名称' || h === 'song_name');
        const artistIdx = headers.findIndex((h) => h === '歌手' || h === 'artist');
        const langIdx = headers.findIndex((h) => h === '语言' || h === 'language');
        const tagsIdx = headers.findIndex((h) => h === '标签' || h === 'tags');
        const notesIdx = headers.findIndex((h) => h === '备注' || h === 'notes');

        if (nameIdx === -1 || artistIdx === -1) {
          showToast('CSV格式错误：缺少歌曲名称或歌手列');
          return;
        }

        const parsed: SongInput[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (!cols[nameIdx]) continue;
          parsed.push({
            song_name: cols[nameIdx],
            artist: cols[artistIdx] || '',
            language: langIdx >= 0 ? cols[langIdx] || '' : '',
            tags: tagsIdx >= 0 && cols[tagsIdx] ? cols[tagsIdx].split('|').map((t) => t.trim()) : [],
            notes: notesIdx >= 0 ? cols[notesIdx] || '' : '',
          });
        }

        setImportData(parsed);
        setImportOpen(true);
      };
      reader.readAsText(file);
      // Reset to allow re-import of same file
      e.target.value = '';
    },
    [showToast]
  );

  const handleExport = useCallback(() => {
    const headers = ['歌曲名称', '歌手', '语言', '标签', '备注'];
    const rows = songs.map((s) => [
      s.song_name,
      s.artist,
      s.language,
      s.tags,
      s.notes,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `歌单_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [songs]);

  const handleImportConfirm = useCallback(
    (selected: SongInput[]) => {
      importSongs(selected);
      setImportOpen(false);
      showToast(`已导入 ${selected.length} 首歌曲`);
    },
    [importSongs, showToast]
  );

  const handleRollback = useCallback(
    async (versionId: number) => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/versions/${versionId}/rollback`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          showToast('回滚成功');
          refresh();
          setVersionsOpen(false);
        } else {
          showToast('回滚失败');
        }
      } catch {
        showToast('回滚失败，请重试');
      }
    },
    [showToast, refresh]
  );

  return (
    <div className="space-y-4">
      <TableToolbar
        unsavedCount={unsavedCount}
        selectedCount={selectedIds.size}
        totalCount={songs.length}
        onAdd={addSong}
        onDeleteSelected={handleDeleteSelected}
        onSave={handleSave}
        onImport={handleImportFile}
        onExport={handleExport}
        onShowVersions={() => setVersionsOpen(true)}
        onSelectAll={handleSelectAll}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelected}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <SongTable
          songs={songs}
          pendingChanges={changes}
          onUpdate={updateSong}
          onDelete={(id) => deleteSongs([id])}
          onSelect={handleSelect}
          selectedIds={selectedIds}
          detectDuplicates={detectDuplicates}
        />
      )}

      <ImportPreview
        open={importOpen}
        songs={importData}
        existingSongs={songs}
        onConfirm={handleImportConfirm}
        onClose={() => setImportOpen(false)}
      />

      <VersionHistory
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        onRollback={handleRollback}
      />

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { SongVersion, ApiResponse } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface VersionHistoryProps {
  open: boolean;
  onClose: () => void;
  onRollback: (versionId: number) => void;
}

export default function VersionHistory({ open, onClose, onRollback }: VersionHistoryProps) {
  const [versions, setVersions] = useState<SongVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const token = localStorage.getItem('admin_token');
    fetch('/api/versions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<ApiResponse<SongVersion[]>>)
      .then((json) => {
        if (json.success && json.data) {
          setVersions(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const handleRollback = (id: number) => {
    if (confirmId === id) {
      onRollback(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="版本历史">
      {loading ? (
        <p className="text-center text-gray-400 py-4 text-sm">加载中...</p>
      ) : versions.length === 0 ? (
        <p className="text-center text-gray-400 py-4 text-sm">暂无版本记录</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="min-w-0">
                <p className="text-sm text-gray-800">{v.summary}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(v.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <Button
                variant={confirmId === v.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleRollback(v.id)}
                className="flex-shrink-0"
              >
                {confirmId === v.id ? '确认回滚' : '回滚'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

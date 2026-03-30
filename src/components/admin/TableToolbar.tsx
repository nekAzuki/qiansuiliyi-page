import Button from '@/components/ui/Button';

interface TableToolbarProps {
  unsavedCount: number;
  selectedCount: number;
  onAdd: () => void;
  onDeleteSelected: () => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onShowVersions: () => void;
}

export default function TableToolbar({
  unsavedCount,
  selectedCount,
  onAdd,
  onDeleteSelected,
  onSave,
  onImport,
  onExport,
  onShowVersions,
}: TableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={onAdd}>
        添加歌曲
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onDeleteSelected}
        disabled={selectedCount === 0}
      >
        删除选中{selectedCount > 0 && `(${selectedCount})`}
      </Button>

      <Button size="sm" onClick={onSave} disabled={unsavedCount === 0}>
        保存修改
        {unsavedCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs">
            {unsavedCount}
          </span>
        )}
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onImport}>
        导入
      </Button>
      <Button variant="ghost" size="sm" onClick={onExport}>
        导出
      </Button>
      <Button variant="ghost" size="sm" onClick={onShowVersions}>
        版本历史
      </Button>
    </div>
  );
}

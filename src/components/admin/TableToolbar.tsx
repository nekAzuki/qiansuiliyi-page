interface TableToolbarProps {
  unsavedCount: number;
  selectedCount: number;
  totalCount: number;
  saving?: boolean;
  onAdd: () => void;
  onDeleteSelected: () => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onShowVersions: () => void;
  onSelectAll: () => void;
}

export default function TableToolbar({
  unsavedCount,
  selectedCount,
  totalCount,
  saving,
  onAdd,
  onDeleteSelected,
  onSave,
  onImport,
  onExport,
  onShowVersions,
  onSelectAll,
}: TableToolbarProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selection actions — gray/neutral */}
      <button
        onClick={onSelectAll}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-primary-400 text-primary-700 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 transition-colors font-medium whitespace-nowrap"
      >
        <input type="checkbox" checked={allSelected} readOnly className="rounded border-primary-400 text-primary-500 pointer-events-none" />
        全选
      </button>

      <button
        onClick={onDeleteSelected}
        disabled={selectedCount === 0}
        className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        删除选中{selectedCount > 0 && <span className="ml-1">({selectedCount})</span>}
      </button>

      {/* Spacer between selection and editing groups */}
      <div className="w-16" />

      {/* Primary action — add */}
      <button
        onClick={onAdd}
        className="px-3 py-1.5 text-sm rounded-lg bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm transition-colors"
      >
        添加歌曲
      </button>

      {/* Save — prominent green, only when there are changes */}
      <button
        onClick={onSave}
        disabled={unsavedCount === 0 || saving}
        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
      >
        {saving && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {saving ? '保存中...' : '保存修改'}
        {!saving && unsavedCount > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white/25 text-xs">
            {unsavedCount}
          </span>
        )}
      </button>

      <div className="flex-1" />

      {/* Utility actions — subtle */}
      <button
        onClick={onImport}
        className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        导入
      </button>
      <button
        onClick={onExport}
        className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        导出
      </button>
      <button
        onClick={onShowVersions}
        className="px-3 py-1.5 text-sm rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        版本历史
      </button>
    </div>
  );
}

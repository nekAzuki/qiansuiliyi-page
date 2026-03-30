interface TagProps {
  label: string;
  active: boolean;
  onClick?: () => void;
}

export default function Tag({ label, active, onClick }: TagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
        whitespace-nowrap transition-colors duration-150 select-none
        ${
          active
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
        }
      `}
    >
      {label}
    </button>
  );
}

import { ChevronRight } from 'lucide-react';

interface ContentRowProps {
  row: {
    id: string;
    title: string;
    meta: string;
  };
  onClick?: () => void;
}

export function ContentRow({ row, onClick }: ContentRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[57px] w-full items-center justify-between rounded-[10px] border-none bg-card px-3 py-3 text-left cursor-pointer"
    >
      <div>
        <div className="typo-body-xs-semibold text-main">{row.title}</div>
        <div className="typo-body-xs-regular text-hint">{row.meta}</div>
      </div>
      <ChevronRight size={14} className="text-faint" />
    </button>
  );
}

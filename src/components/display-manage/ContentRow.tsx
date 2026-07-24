import { ChevronRight } from 'lucide-react';

interface ContentRowProps {
  row: {
    id: string;
    title: string;
    meta: string;
  };
}

export function ContentRow({ row }: ContentRowProps) {
  return (
    <button className="w-full flex items-center justify-between p-3 bg-card border-none rounded-[10px] cursor-pointer text-left">
      <div>
        <div className="typo-body-xs-semibold text-main">{row.title}</div>
        <div className="typo-body-xs-regular text-hint">{row.meta}</div>
      </div>
      <ChevronRight size={14} className="text-faint" />
    </button>
  );
}

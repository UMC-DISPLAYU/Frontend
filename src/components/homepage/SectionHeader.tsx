import { ChevronRightIcon } from 'lucide-react';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 mb-2.5">
      <h2 className="typo-body-xl-bold text-main">{title}</h2>
      <button
        type="button"
        className="flex items-center typo-body-xs-regular text-faint bg-transparent border-none cursor-pointer p-0"
      >
        더보기
        <ChevronRightIcon className="text-faint size-3" />
      </button>
    </div>
  );
}

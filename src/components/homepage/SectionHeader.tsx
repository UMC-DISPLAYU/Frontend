import ChevronRightIcon from '@/assets/ChevronRightIcon.svg';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 mb-2.5">
      <h2 className="text-xl font-bold leading-7 text-neutral-900">{title}</h2>
      <button
        type="button"
        className="flex items-center gap-px text-xs leading-none text-neutral-500 bg-transparent border-none cursor-pointer p-0"
      >
        더보기
        <img src={ChevronRightIcon} className="size-2.5" />
      </button>
    </div>
  );
}

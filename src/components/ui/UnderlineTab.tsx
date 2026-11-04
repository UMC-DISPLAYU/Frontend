import { cn } from '@/utils/cn';

type UnderlineTabProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function UnderlineTab({ label, selected, onClick }: UnderlineTabProps) {
  return (
    <button
      aria-selected={selected}
      className={cn(
        'typography-body-xl-semibold shrink-0 cursor-pointer border-b-2 px-3 py-2 whitespace-nowrap',
        selected
          ? 'border-interactive-selected text-primary'
          : 'border-transparent text-primary-400',
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}

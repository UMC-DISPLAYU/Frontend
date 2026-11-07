import { cn } from '@/utils/cn';

type UnderlineTabProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function UnderlineTab({ label, selected, onClick }: UnderlineTabProps) {
  return (
    // 패널을 바꾸는 탭이 아니라 목록 필터를 고르는 버튼이라 tab 대신 토글 버튼 의미(aria-pressed)를 쓴다
    <button
      aria-pressed={selected}
      className={cn(
        'typography-body-xl-semibold shrink-0 cursor-pointer border-b-2 px-3 py-2 whitespace-nowrap',
        selected
          ? 'border-interactive-selected text-primary'
          : 'border-transparent text-primary-400',
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

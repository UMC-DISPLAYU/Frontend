import type { DisplayPublishStatus } from '@/api/dto';
import { cn } from '@/utils/cn';

interface StatusStyle {
  label: string;
  dotClassName: string;
  textClassName?: string;
}

// 프로토타입 flow.css `.st` 값. 준비 중은 글자색을 지정하지 않아 놓인 자리의 글자색을 따른다
const STATUS_STYLE: Record<DisplayPublishStatus, StatusStyle> = {
  DRAFT: { label: '준비 중', dotClassName: 'bg-[#27272a]' },
  PENDING_REVIEW: {
    label: '심사 중',
    dotClassName: 'bg-[#3b82f6]',
    textClassName: 'text-[#2563eb]',
  },
  REJECTED: { label: '반려', dotClassName: 'bg-[#fb2c36]', textClassName: 'text-[#fb2c36]' },
  PUBLISHED: { label: '공개 중', dotClassName: 'bg-[#00c758]', textClassName: 'text-[#00a846]' },
};

interface DisplayStatusLabelProps {
  status: DisplayPublishStatus;
  /** 공개 상태가 아닌 값(전시 기간 상태 등)을 보일 때 문구만 바꾼다. 색은 `status` 를 따른다 */
  label?: string;
  className?: string;
}

export function DisplayStatusLabel({ status, label, className }: DisplayStatusLabelProps) {
  const style = STATUS_STYLE[status];

  return (
    <span
      className={cn(
        'typography-body-md-semibold inline-flex items-center gap-1.5',
        style.textClassName,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-circle', style.dotClassName)}
      />
      {label ?? style.label}
    </span>
  );
}

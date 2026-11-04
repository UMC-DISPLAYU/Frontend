import heartFilledIcon from '@/assets/icons/HeartFilledIcon.svg';
import heartIcon from '@/assets/icons/HeartIcon.svg';
import { cn } from '@/utils/cn';

type LikeBadgeProps = {
  count: number;
  liked?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function LikeBadge({ count, liked = false, onClick, disabled, className }: LikeBadgeProps) {
  const badgeClassName = cn(
    'flex items-center gap-0.5 rounded-circle bg-primary-white/60 px-2.25 py-1 shadow-md backdrop-blur-md',
    className,
  );
  const content = (
    <>
      <img alt="" className="size-3.5" src={liked ? heartFilledIcon : heartIcon} />
      <span className="typography-body-md-medium text-secondary">{count}</span>
    </>
  );

  if (!onClick) {
    return (
      <span aria-label={`좋아요 ${count}개`} className={badgeClassName} role="img">
        {content}
      </span>
    );
  }

  return (
    <button
      aria-label={liked ? `좋아요 취소, 현재 ${count}개` : `좋아요, 현재 ${count}개`}
      aria-pressed={liked}
      className={cn(badgeClassName, 'cursor-pointer disabled:cursor-default')}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}

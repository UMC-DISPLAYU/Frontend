import { cn } from '@/utils/cn';

type Props = {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  /* 화면마다 다른 위치(위 여백 · 최소 폭). -m-2 p-2로 44px 터치 영역을 넓힌 만큼 보이는 자리는 그대로다 */
  className?: string;
};

/* 프로토타입 작품 · 전시 상세의 `i-heart`(24칸, 선 1.7)를 그대로 옮겼다 */
export function DetailLikeButton({ liked, count, onClick, disabled, title, className }: Props) {
  return (
    <button
      type="button"
      aria-label="좋아요"
      aria-pressed={liked}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        '-m-2 flex min-w-11 shrink-0 cursor-pointer flex-col items-center p-2 transition-transform duration-fast ease-standard active:scale-92 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'size-6 shrink-0 text-icon-primary transition-transform duration-base ease-standard',
          liked && 'scale-110 fill-current',
        )}
      >
        <path d="M12 20.2S4.5 15.6 4.5 9.9A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.3c0 5.7-7.5 10.3-7.5 10.3z" />
      </svg>
      <span className="typography-body-md-medium text-secondary">{count}</span>
    </button>
  );
}

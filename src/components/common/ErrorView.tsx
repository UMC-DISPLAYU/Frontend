import { cn } from '@/utils/cn';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  fullScreen?: boolean;
}

export function ErrorView({
  title,
  message = '오류가 발생했습니다.',
  onRetry,
  retryLabel = '다시 시도',
  className,
  fullScreen = true,
}: ErrorViewProps) {
  const displayMessage = title || message;

  return (
    <div
      className={cn(
        'w-full max-w-md mx-auto flex flex-col items-center justify-center gap-3 p-6 bg-page text-center select-none',
        fullScreen ? 'h-dvh' : 'flex-1 my-auto min-h-60',
        className,
      )}
    >
      <p className="typo-body-sm-regular text-sub600 whitespace-pre-line">{displayMessage}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="typo-body-sm-regular text-faint underline cursor-pointer hover:text-sub600 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

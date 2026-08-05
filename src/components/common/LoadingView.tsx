import { cn } from '@/utils/cn';

interface LoadingViewProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingView({
  message = '로딩 중...',
  className,
  fullScreen = true,
}: LoadingViewProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[402px] mx-auto flex flex-col items-center justify-center gap-3 p-6 bg-page text-center select-none font-[Pretendard,sans-serif]',
        fullScreen ? 'h-dvh' : 'flex-1 my-auto min-h-50',
        className,
      )}
    >
      <div className="loader text-main" />
      <p className="typo-body-sm-medium text-sub600">{message}</p>
    </div>
  );
}

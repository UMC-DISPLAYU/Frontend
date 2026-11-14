import { Loader } from '@/components/ui';
import { cn } from '@/utils/cn';

interface LoadingViewProps {
  className?: string;
  fullScreen?: boolean;
}

/** 영역 가운데 로더(디자인 LOADING-SPEC 11-14). 문구는 오래 걸릴 때만 "불러오는 중" 하나를 보인다 */
export function LoadingView({ className, fullScreen = true }: LoadingViewProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col items-center justify-center gap-3 p-6 text-center text-primary select-none',
        fullScreen ? 'h-dvh' : 'my-auto min-h-50 flex-1',
        className,
      )}
    >
      <Loader />
      <p aria-hidden="true" className="loader-hint typography-body-md-medium text-tertiary">
        불러오는 중
      </p>
    </div>
  );
}

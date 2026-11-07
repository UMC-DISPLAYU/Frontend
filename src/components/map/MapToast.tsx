import { cn } from '@/utils/cn';

interface MapToastProps {
  message: string;
  isVisible: boolean;
}

export function MapToast({ message, isVisible }: MapToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'typography-body-lg-medium pointer-events-none fixed bottom-[calc(var(--map-sheet-visible)+80px)] left-1/2 z-100 max-w-[calc(100vw-40px)] -translate-x-1/2 rounded-8 bg-primary-black px-4.5 py-3.5 text-interactive-inverse transition-[opacity,translate] duration-300 ease-[cubic-bezier(.16,1,.3,1)]',
        'md:bottom-10 md:left-[calc(50%+var(--map-panel-width)/2)]',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      {message}
    </div>
  );
}

import { useEffect, useRef } from 'react';

import { useHideFooter, useHideNavbar } from '@/components/layout';
import { BackButton } from '@/components/ui/BackButton';

interface Props {
  htmlSrc: string;
  title: string;
  isClosing?: boolean;
  onBack: () => void;
}

const SWIPE_BACK_THRESHOLD = 70;

export function DuPickHtmlView({ htmlSrc, title, isClosing = false, onBack }: Props) {
  useHideFooter();
  useHideNavbar();

  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'DUPICK_SWIPE_BACK') {
        onBack();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onBack]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX === null || endX === undefined) return;
    if (endX - startX > SWIPE_BACK_THRESHOLD) {
      onBack();
    }
  };

  return (
    <div
      className={[
        'fixed inset-0 z-60 mx-auto min-h-dvh w-full max-w-md bg-page shadow-[0_0_32px_rgba(17,18,23,0.14)]',
        'transition-transform duration-300 ease-out will-change-transform',
        isClosing ? 'translate-x-full' : 'translate-x-0',
      ].join(' ')}
    >
      <div className="fixed top-4 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pointer-events-none">
        <BackButton onClick={onBack} className="pointer-events-auto" />
      </div>
      <iframe src={htmlSrc} title={title} className="block h-dvh w-full border-0 bg-page" />
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-20 h-dvh w-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}

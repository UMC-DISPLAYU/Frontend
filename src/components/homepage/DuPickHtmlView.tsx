import { useEffect, useRef, useState } from 'react';

import { LoadingView } from '@/components/common';
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

  const [isLoading, setIsLoading] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;

      if (data?.type === 'DUPICK_SWIPE_START') {
        setIsDragging(true);
        setDragOffset(0);
        return;
      }

      if (data?.type === 'DUPICK_SWIPE_MOVE') {
        const offset = Number(data.offset);
        if (Number.isFinite(offset)) {
          setDragOffset(Math.max(0, offset));
        }
        return;
      }

      if (data?.type === 'DUPICK_SWIPE_CANCEL') {
        setIsDragging(false);
        setDragOffset(0);
        return;
      }

      if (data?.type === 'DUPICK_SWIPE_BACK') {
        setIsDragging(false);
        setDragOffset(0);
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
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const currentX = e.touches[0]?.clientX;

    if (startX === null || currentX === undefined) return;
    setDragOffset(Math.max(0, currentX - startX));
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX === null || endX === undefined) return;
    if (endX - startX > SWIPE_BACK_THRESHOLD) {
      setIsDragging(false);
      setDragOffset(0);
      onBack();
      return;
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      className={[
        'fixed inset-0 z-60 mx-auto min-h-dvh w-full max-w-md bg-page shadow-[0_0_32px_rgba(17,18,23,0.14)]',
        isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out',
        'will-change-transform',
      ].join(' ')}
      style={{ transform: `translateX(${isClosing ? '100%' : `${dragOffset}px`})` }}
    >
      <div className="fixed top-4 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pointer-events-none">
        <BackButton onClick={onBack} className="pointer-events-auto" />
      </div>
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-page">
          <LoadingView message="DU Pick을 불러오는 중..." />
        </div>
      )}
      <iframe
        src={htmlSrc}
        title={title}
        className="block h-dvh w-full border-0 bg-page"
        onLoad={() => setIsLoading(false)}
      />
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-20 h-dvh w-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      />
    </div>
  );
}

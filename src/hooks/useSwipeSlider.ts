import { useState } from 'react';

interface UseSwipeSliderProps {
  itemCount: number;
  threshold?: number;
}

export function useSwipeSlider({ itemCount, threshold = 40 }: UseSwipeSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = (clientX: number) => {
    if (itemCount <= 1) return;
    setStartX(clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || startX === null) return;
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % itemCount);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
    }
    setIsDragging(false);
    setDragOffset(0);
    setStartX(null);
  };

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX),
    onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX),
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: (e: React.TouchEvent) => handleStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
    onTouchEnd: handleEnd,
  };

  return {
    activeIndex,
    setActiveIndex,
    dragOffset,
    isDragging,
    handlers,
  };
}

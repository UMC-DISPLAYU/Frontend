import { useEffect, useRef, useState } from 'react';

interface UseDragReorderProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  step: number;
}

export function useDragReorder<T>({ items, onReorder, step }: UseDragReorderProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const startY = useRef(0);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  useEffect(() => {
    if (dragIndex === null) return;

    const handleMove = (e: PointerEvent) => {
      const dy = e.clientY - startY.current;
      const stepCount = Math.round(dy / step);
      const target = Math.min(items.length - 1, Math.max(0, dragIndex + stepCount));

      if (target !== dragIndex) {
        move(dragIndex, target);
        startY.current += stepCount * step;
        setDragIndex(target);
        setOffset(dy - stepCount * step);
      } else {
        setOffset(dy);
      }
    };

    const handleUp = () => {
      setDragIndex(null);
      setOffset(0);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragIndex, items, step]);

  const handleStart = (index: number, clientY: number) => {
    startY.current = clientY;
    setDragIndex(index);
    setOffset(0);
  };

  return {
    dragIndex,
    offset,
    move,
    handleStart,
  };
}

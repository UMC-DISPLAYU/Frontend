import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 3000;

export function useMapToast() {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((next: string) => {
    setMessage(next);
    setIsVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsVisible(false), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { message, isVisible, show };
}

import { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { fitArtistByline } from './fitArtistByline';

/** 작가 이름을 카드 폭에 맞춰 줄인다(fitArtistByline). 폭이 바뀌거나 글꼴이 늦게 들어오면 다시 맞춘다 */
export function ArtistByline({ names, className }: { names: string[]; className?: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(() => names.join(', '));
  const key = names.join('|');

  useLayoutEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    const fit = () => {
      const width = box.clientWidth;
      // 숨겨진 상태(리스트형 전환 등)에서는 폭이 0이라 보일 때 다시 맞춘다
      if (!width) return;
      setText(
        fitArtistByline(key.split('|'), (candidate) => {
          measure.textContent = candidate;
          return measure.scrollWidth <= width + 0.5;
        }),
      );
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    void document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [key]);

  return (
    <span ref={boxRef} className={cn('relative block truncate', className)}>
      {text}
      {/* 후보 문구를 같은 글꼴로 재는 자리. React 가 자식을 그리지 않아 textContent 를 직접 바꿔도 된다 */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute top-0 left-0 whitespace-nowrap"
      />
    </span>
  );
}

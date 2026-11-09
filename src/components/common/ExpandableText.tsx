import { useEffect, useRef, useState } from 'react';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  text: string;
  /* 글자 모양(크기 · 색). 3줄 자르기는 이 컴포넌트가 맡는다 */
  className?: string;
};

/* 3줄까지 보이고 넘치면 말줄임(…) + 더보기, 펼치면 접기 */
export function ExpandableText({ text, className }: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  // 펼친 뒤에는 잘리지 않아 다시 재면 접기 버튼이 사라지므로 접힌 상태에서만 잰다
  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;
    const measure = () => setIsClamped(element.scrollHeight > element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <>
      <p
        ref={textRef}
        className={cn('whitespace-pre-line', className, !expanded && 'line-clamp-3')}
      >
        {text}
      </p>
      {(isClamped || expanded) && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="typography-body-md-medium -my-2 inline-flex cursor-pointer items-center gap-0.5 py-2 text-tertiary hover:text-primary"
          >
            {expanded ? '접기' : '더보기'}
            <ChevronRight
              aria-hidden="true"
              size={14}
              strokeWidth={1.7}
              className={cn('transition-transform duration-fast', expanded && '-rotate-90')}
            />
          </button>
        </div>
      )}
    </>
  );
}

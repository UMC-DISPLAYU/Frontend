import { type TransitionEvent, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  text: string;
  /* 글자 모양(크기 · 색). 3줄 자르기는 이 컴포넌트가 맡는다 */
  className?: string;
};

const CLAMP_CLASS = 'line-clamp-3';

/* 3줄까지 보이고 넘치면 말줄임(…) + 더보기, 펼치면 접기. 높이가 미끄러지듯 바뀐다 */
export function ExpandableText({ text, className }: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  // 접히는 동안에는 말줄임을 걸지 않는다. 걸면 3줄 뒤 글자가 높이가 줄기 전에 먼저 사라진다
  const [isClosing, setIsClosing] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const clamp = !expanded && !isClosing;

  // 펼친 뒤에는 잘리지 않아 다시 재면 접기 버튼이 사라지므로 접힌 상태에서만 잰다
  useEffect(() => {
    const element = textRef.current;
    if (!element || !clamp) return;
    const measure = () => setIsClamped(element.scrollHeight > element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, clamp]);

  // height: auto 는 전환되지 않아 시작 · 끝 높이를 px 로 잡아 전환하고, 끝나면 auto 로 돌린다
  const toggle = () => {
    const element = textRef.current;
    if (!element) return;
    const from = element.offsetHeight;
    let to: number;
    if (expanded) {
      element.classList.add(CLAMP_CLASS);
      to = element.offsetHeight;
      element.classList.remove(CLAMP_CLASS);
      flushSync(() => {
        setExpanded(false);
        setIsClosing(true);
      });
    } else {
      flushSync(() => setExpanded(true));
      to = element.scrollHeight;
    }
    // 높이가 같으면 transitionend 가 오지 않아 접히는 중 상태에 머문다
    if (from === to) {
      setIsClosing(false);
      return;
    }
    element.style.height = `${from}px`;
    void element.offsetHeight;
    element.style.height = `${to}px`;
  };

  const onTransitionEnd = (event: TransitionEvent<HTMLParagraphElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'height') return;
    // transitionend 는 렌더가 미뤄져, 높이를 먼저 풀면 말줄임이 붙기 전 한 프레임 동안 전체 글이 보인다
    flushSync(() => setIsClosing(false));
    event.currentTarget.style.height = '';
  };

  return (
    <>
      <p
        ref={textRef}
        onTransitionEnd={onTransitionEnd}
        className={cn(
          'overflow-hidden whitespace-pre-line transition-[height] duration-base ease-standard',
          className,
          clamp && CLAMP_CLASS,
        )}
      >
        {text}
      </p>
      {(isClamped || expanded) && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={toggle}
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

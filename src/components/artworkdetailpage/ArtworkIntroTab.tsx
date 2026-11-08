import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { ProcessStrip } from './ProcessStrip';

type Props = {
  content?: string | null;
  point?: string | null;
  processImageUrls: string[];
};

export function ArtworkIntroTab({ content, point, processImageUrls }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  /* 펼치면 line-clamp가 풀려 다시 재도 잘린 상태로 잡히지 않으므로 접힌 동안만 관찰합니다. */
  useEffect(() => {
    const element = contentRef.current;
    if (!element || isExpanded) return;

    const measure = () => setIsClamped(element.scrollHeight > element.clientHeight + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [content, isExpanded]);

  return (
    <div>
      <div className="px-gutter pt-7 desktop:px-0">
        {content?.trim() && (
          <>
            <p
              ref={contentRef}
              className={cn(
                'typography-body-lg-regular desktop:typography-body-xl-regular break-words whitespace-pre-line text-primary',
                !isExpanded && 'line-clamp-3',
              )}
            >
              {content}
            </p>
            {isClamped && !isExpanded && (
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  aria-expanded={false}
                  onClick={() => setIsExpanded(true)}
                  className="typography-body-md-medium h-7 cursor-pointer text-tertiary transition-colors duration-fast ease-standard hover:text-primary"
                >
                  더보기
                </button>
              </div>
            )}
          </>
        )}

        {point?.trim() && (
          <p className="typography-body-lg-regular desktop:typography-body-xl-regular mt-5 rounded-12 bg-secondary p-4 break-words whitespace-pre-line text-secondary first:mt-0">
            {point}
          </p>
        )}
      </div>

      {processImageUrls.length > 0 && <ProcessStrip imageUrls={processImageUrls} />}

      <div className="h-6" />
    </div>
  );
}

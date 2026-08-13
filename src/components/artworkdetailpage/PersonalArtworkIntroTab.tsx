import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRight, ChevronUp } from 'lucide-react';

import type { PersonalArtworkResponseDataDto } from '@/api/dto';
import { ArtworkArtistRow } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { cn } from '@/utils/cn';

type Props = {
  artwork: PersonalArtworkResponseDataDto;
};

export function PersonalArtworkIntroTab({ artwork }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContentClamped, setIsContentClamped] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  /* 다른 작품 소개로 콘텐츠가 바뀌면(라우트 파라미터만 바뀌어 리마운트되지 않는 경우) 접힌 상태로 되돌립니다. */
  const [prevContent, setPrevContent] = useState(artwork.content);
  if (artwork.content !== prevContent) {
    setPrevContent(artwork.content);
    setIsExpanded(false);
  }

  /*
   * 펼친 상태에서는 line-clamp가 풀려 요소 자체의 높이가 커지는데, 그걸 리사이즈로 감지해
   * 다시 재보면 scrollHeight === clientHeight가 되어 접기 버튼이 사라집니다. 접힌 상태일 때만
   * 관찰합니다.
   */
  useEffect(() => {
    const el = contentRef.current;
    if (!el || isExpanded) return;

    const measure = () => setIsContentClamped(el.scrollHeight > el.clientHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => observer.disconnect();
  }, [artwork.content, isExpanded]);

  const processImages = useMemo(
    () =>
      artwork.images
        .filter((img) => img.imageType === 'WORK_PROCESS')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [artwork.images],
  );

  return (
    <div className="pb-28">
      {/* 작품소개 */}
      {artwork.content && (
        <section className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="typo-body-xl-bold text-main">작품소개</h2>
          </div>
          <p
            ref={contentRef}
            className={cn(
              'typo-body-sm-regular text-main leading-relaxed',
              !isExpanded && 'line-clamp-3',
            )}
          >
            {artwork.content}
          </p>
          {isContentClamped && (
            <div className="flex items-center justify-end pt-3">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center gap-0.5 typo-body-xs-regular text-faint cursor-pointer"
              >
                <span>{isExpanded ? '접기' : '더보기'}</span>
                {isExpanded ? (
                  <ChevronUp size={14} strokeWidth={1.5} />
                ) : (
                  <ChevronRight size={14} strokeWidth={1.5} />
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* 작업과정 */}
      {processImages.length > 0 && (
        <section className="flex flex-col items-start gap-2.5 self-stretch bg-[#E9E9E9] py-5 mix-blend-multiply">
          <div className="flex flex-col items-center gap-3 self-stretch px-5">
            <div className="flex w-[362px] items-end justify-between self-start">
              <h2 className="typo-body-xl-bold text-main">작업과정</h2>
            </div>
            <div
              className="-mx-5 flex min-w-0 self-stretch gap-2 overflow-x-auto px-[15px]"
              style={{ scrollbarWidth: 'none' }}
            >
              {processImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.imageUrl}
                  alt={`작업과정 ${idx + 1}`}
                  className="h-[152px] w-[119px] shrink-0 rounded-[13px] bg-[rgba(161,156,156,0.5)] object-cover shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 감상 포인트 */}
      {artwork.point && (
        <section className="px-5 pt-5 pb-5">
          <h2 className="typo-body-xl-bold text-main mb-3">감상 포인트</h2>
          <p className="typo-body-sm-regular text-main leading-relaxed">{artwork.point}</p>
        </section>
      )}

      {/* 작가 정보 */}
      <section className="flex flex-col">
        <ArtworkArtistRow userId={artwork.userId} displayName={artwork.nickname || '작가 미상'} />
      </section>
    </div>
  );
}

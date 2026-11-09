import { useEffect, useRef, useState } from 'react';

import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import contentStack from '@/assets/display-detail/content-stack.svg';
import placeMap from '@/assets/display-detail/place-map.svg';
import placePin from '@/assets/display-detail/place-pin.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

type Props = {
  display: DisplayDetailDto;
};

/* 섹션 사이 연한 구분선. 900px 이상은 본문 폭 끝까지 */
const DIVIDER =
  'relative before:absolute before:inset-x-gutter before:top-0 before:h-px before:bg-tertiary desktop:before:inset-x-0';

function IntroText({ content }: { content: string }) {
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
  }, [content, expanded]);

  return (
    <section aria-label="전시소개" className="px-gutter pt-5 desktop:px-0">
      <p
        ref={textRef}
        className={cn(
          'typography-body-lg-regular whitespace-pre-line text-pretty text-secondary',
          !expanded && 'line-clamp-3',
        )}
      >
        {content}
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
    </section>
  );
}

/* 피그마 메모: 인스타그램 게시물 첫 표지(3:4)를 자르지 않고 144×192로, 아래에 콘텐츠 제목 한 줄 */
function ContentCards({ display }: Props) {
  return (
    <section aria-label="전시콘텐츠" className={cn(DIVIDER, 'mt-7 px-gutter pt-5 desktop:px-0')}>
      <div className="-mx-gutter flex snap-x snap-proximity scroll-px-gutter gap-3 overflow-x-auto px-gutter [scrollbar-width:none] desktop:mx-0 desktop:grid desktop:grid-cols-3 desktop:overflow-visible desktop:px-0 [&::-webkit-scrollbar]:hidden">
        {display.contentCategories.map((category) => (
          <Link
            key={category.categoryId}
            to={`/display/${display.displayId}/contents?category=${category.categoryId}`}
            className="group w-36 shrink-0 snap-start rounded-12 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus desktop:w-auto"
          >
            <div className="relative">
              <OptimizedImage
                src={category.contents[0]?.imageUrl}
                displayWidth={288}
                alt=""
                skeleton
                frameClassName="aspect-3/4 w-full overflow-hidden rounded-12 border border-primary bg-tertiary"
                className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-104"
              />
              {/* 인스타그램처럼 사진이 여러 장이면 오른쪽 위에 묶음 표시 */}
              {category.contents.length > 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.75 right-1.75 grid size-5 place-items-center"
                >
                  <img src={contentStack} alt="" />
                </span>
              )}
            </div>
            <strong className="typography-body-lg-semibold mt-2 block truncate">
              {category.name}
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* 지도는 저작권 때문에 실제 지도 캡처 대신 무채색 그림을 쓴다(프로토타입과 같은 그림) */
function PlaceCard({ display }: Props) {
  const { placeName, roadAddress, latitude, longitude } = display.location;
  const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${latitude},${longitude}`;

  return (
    <section aria-label="위치 안내" className={cn(DIVIDER, 'mt-5 px-gutter pt-6.25 desktop:px-0')}>
      <div className="overflow-hidden rounded-12 bg-base-black">
        <div aria-hidden="true" className="relative h-40">
          <img src={placeMap} alt="" className="size-full object-cover" />
          <img
            src={placePin}
            alt=""
            className="absolute top-15.5 left-1/2 size-8.75 -translate-x-1/2"
          />
        </div>
        <div className="flex min-h-18 items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <strong className="typography-body-lg-bold block text-quaternary">{placeName}</strong>
            {roadAddress && (
              <small className="typography-body-md-medium block text-tertiary">{roadAddress}</small>
            )}
          </div>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="typography-body-md-semibold inline-flex h-8 shrink-0 items-center rounded-8 border border-primary px-3 text-quaternary transition duration-fast ease-standard hover:bg-primary-white/12 focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-96"
          >
            지도 보기
          </a>
        </div>
      </div>
    </section>
  );
}

export function IntroPanel({ display }: Props) {
  return (
    <div className="pb-10">
      {display.content && <IntroText content={display.content} />}
      {display.contentCategories.length > 0 && <ContentCards display={display} />}
      {display.location?.placeName && <PlaceCard display={display} />}
    </div>
  );
}

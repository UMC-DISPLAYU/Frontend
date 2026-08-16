import { useEffect, useRef, useState } from 'react';

import { ChevronRight, ChevronUp, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { DisplayContentCategoryDto, DisplayDetailDto } from '@/api/dto/display.dto';
import LocationMapPlaceholder from '@/assets/displaydetailpage/LocationMapPlaceholder.svg';
import LocationPinIcon from '@/assets/displaydetailpage/LocationPinIcon.svg';
import { cn } from '@/utils/cn';

type Props = {
  display: DisplayDetailDto;
};

type ContentCarouselProps = {
  category: DisplayContentCategoryDto;
  fullWidth?: boolean;
};

function ContentCategoryCard({ category, fullWidth = false }: ContentCarouselProps) {
  const firstImage = category.contents[0];
  const count = category.contents.length;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-box200 relative cursor-pointer text-left',
        fullWidth ? 'w-full' : 'shrink-0',
      )}
      style={{ width: fullWidth ? undefined : 362, height: 152 }}
    >
      {firstImage ? (
        <img src={firstImage.imageUrl} alt={category.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-neutral-300" />
      )}
      {/* 왼쪽 하단 그라데이션 + 텍스트 오버레이 */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(102, 102, 102, 0.00) 47.49%, rgba(0, 0, 0, 0.5) 82.16%)',
        }}
      />
      <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 text-left">
        <p className="typo-body-md-bold text-white leading-tight">{category.name}</p>
        {(category.description || count > 0) && (
          <p className="typo-body-xxs-regular text-[#d9d9d9]">
            {category.description ? `${category.description} · ` : ''}
            {count}개
          </p>
        )}
      </div>
    </div>
  );
}

export function IntroTab({ display: ex }: Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [isContentClamped, setIsContentClamped] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  /* 다른 전시의 소개로 콘텐츠가 바뀌면(라우트 파라미터만 바뀌어 리마운트되지 않는 경우) 접힌 상태로 되돌립니다. */
  const [prevContent, setPrevContent] = useState(ex.content);
  if (ex.content !== prevContent) {
    setPrevContent(ex.content);
    setExpanded(false);
  }

  const handleGoToContents = () => {
    navigate(`/display/${ex.displayId}/contents`);
  };

  const organizer = [ex.organization, ex.department].filter(Boolean).join(' ');

  /*
   * 펼친 상태에서는 line-clamp가 풀려 요소 자체의 높이가 커지는데, 그걸 리사이즈로 감지해
   * 다시 재보면 scrollHeight === clientHeight가 되어 접기 버튼이 사라집니다. 접힌 상태일 때만
   * 관찰합니다.
   */
  useEffect(() => {
    const el = contentRef.current;
    if (!el || expanded) return;

    const measure = () => setIsContentClamped(el.scrollHeight > el.clientHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => observer.disconnect();
  }, [ex.content, expanded]);

  return (
    <div className="bg-page">
      {/* 전시소개 */}
      {ex.content && (
        <section className="px-5 pt-6">
          <h2 className="mb-2 text-main typo-body-xl-bold">전시소개</h2>
          <p
            ref={contentRef}
            className="typo-body-sm-regular text-main"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: expanded ? 'unset' : 3,
              overflow: expanded ? 'visible' : 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ex.content}
          </p>
          {isContentClamped && (
            <div className="flex justify-end mt-3">
              <button
                type="button"
                id="intro-expand-btn"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center typo-body-xs-regular text-faint cursor-pointer"
              >
                {expanded ? '접기' : '더보기'}
                {expanded ? (
                  <ChevronUp className="text-faint size-3" />
                ) : (
                  <ChevronRight className="text-faint size-3" />
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* 전시콘텐츠 */}
      {ex.contentCategories.length > 0 && (
        <section className="mt-6 py-5 bg-box200">
          <div className="flex items-end justify-between px-5 mb-3">
            <h2 className="typo-body-xl-bold text-main">전시콘텐츠</h2>
            <button
              type="button"
              onClick={handleGoToContents}
              className="flex items-center gap-0.5 typo-body-xs-regular text-faint cursor-pointer"
            >
              <span>더보기</span>
              <ChevronRight className="text-faint size-2.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto px-5" style={{ scrollbarWidth: 'none' }}>
            {ex.contentCategories.map((category) => (
              <button
                key={category.categoryId}
                type="button"
                onClick={handleGoToContents}
                aria-label={`${category.name} 콘텐츠 보기`}
                className={cn(
                  'cursor-pointer',
                  ex.contentCategories.length === 1 ? 'w-full' : 'shrink-0',
                )}
              >
                <ContentCategoryCard
                  category={category}
                  fullWidth={ex.contentCategories.length === 1}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 유의사항 */}
      {ex.note && (
        <section className="px-5 mt-6">
          <h2 className="typo-body-xl-bold text-main mb-3">유의사항</h2>
          <ul className="flex flex-col gap-1.5">
            {ex.note.split('\n').map((line, idx) => (
              <li key={idx} className="flex items-start gap-2 typo-body-sm-regular text-sub600">
                <CircleAlert size={14} className="text-sub600 shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 위치안내 */}
      {ex.location?.placeName && (
        <section className="px-5 mt-6 flex flex-col items-start gap-3">
          <h2 className="typo-body-xl-bold text-main">위치안내</h2>
          <div className="w-full flex flex-col overflow-hidden rounded-[14px] border border-[#e5e7eb]">
            <a
              href={`https://map.kakao.com/link/map/${encodeURIComponent(ex.location.placeName)},${ex.location.latitude},${ex.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-[140px] w-full shrink-0 self-stretch cursor-pointer"
            >
              <img
                src={LocationMapPlaceholder}
                alt="위치 지도"
                className="h-full w-full bg-[#eceff2] object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#111] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]">
                  <img src={LocationPinIcon} alt="" className="size-4" />
                </span>
                <span className="flex max-w-[179px] min-w-0 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white pt-[9px] pr-[10.68px] pb-[8px] pl-[11px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
                  <span className="truncate text-[11px] font-semibold leading-[16.5px] text-[#111]">
                    {ex.location.placeName}
                  </span>
                </span>
              </div>
            </a>
            <div className="flex items-center justify-between gap-3 shrink-0 bg-white px-4 py-3.5">
              <a
                href={`https://map.kakao.com/link/map/${encodeURIComponent(ex.location.placeName)},${ex.location.latitude},${ex.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 min-w-0 cursor-pointer"
              >
                <p className="text-[#111] text-sm font-semibold leading-[21px] break-words">
                  {ex.location.placeName}
                </p>
                <p className="text-[#9ca3af] text-xs font-normal leading-[18px]">
                  {ex.location.roadAddress}
                </p>
              </a>
              <a
                href={`https://map.kakao.com/link/map/${encodeURIComponent(ex.location.placeName)},${ex.location.latitude},${ex.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center justify-center rounded-[10px] border border-[#e5e7eb] pt-[6.5px] pr-[12.414px] pb-[7.5px] pl-[13px] text-[#374151] text-xs font-medium leading-[18px]"
              >
                지도보기
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 주최·문의 */}
      {(organizer || ex.qnaAccount) && (
        <section className="px-5 mt-6 pb-6">
          <h2 className="typo-body-xl-bold text-main mb-3">주최 · 문의</h2>
          <div className="flex flex-col gap-3">
            {organizer && (
              <div className="flex items-center gap-2 typo-body-sm-regular text-main">
                <span className="text-faint w-6 shrink-0">주최</span>
                <span>{organizer}</span>
              </div>
            )}
            {ex.qnaAccount && (
              <div className="flex items-center gap-2 typo-body-sm-regular text-main">
                <span className="text-faint w-6 shrink-0">문의</span>
                <span>
                  {ex.qnaAccount}
                  {ex.contract && ` (${ex.contract})`}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

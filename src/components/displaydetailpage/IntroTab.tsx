import { useState } from 'react';

import { ChevronRight, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { DisplayContentCategoryDto, DisplayDetailDto } from '@/api/dto/display.dto';
import LocationMapPlaceholder from '@/assets/displaydetailpage/LocationMapPlaceholder.svg';

type Props = {
  display: DisplayDetailDto;
};

type ContentCarouselProps = {
  category: DisplayContentCategoryDto;
};

function ContentCategoryCard({ category }: ContentCarouselProps) {
  const firstImage = category.contents[0];
  const count = category.contents.length;

  return (
    <div
      className="shrink-0 rounded-xl overflow-hidden bg-box200 relative cursor-pointer text-left"
      style={{ width: 362, height: 152 }}
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
          background: 'linear-gradient(180deg, rgba(102, 102, 102, 0.00) 47.49%, #000 82.16%)',
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

  const handleGoToContents = () => {
    navigate(`/display/${ex.displayId}/contents`);
  };

  return (
    <div className="bg-page">
      {/* 전시소개 */}
      <section className="px-5 pt-6">
        <h2 className="mb-2 text-main typo-body-xl-bold">전시소개</h2>
        <p
          className="typo-body-sm-regular text-main"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: expanded ? 'unset' : 3,
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {ex.content}
        </p>
        <div className="flex justify-end mt-3">
          <button
            type="button"
            id="intro-expand-btn"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center typo-body-xs-regular text-faint cursor-pointer"
          >
            {expanded ? '접기' : '더보기'}
            <ChevronRight className="text-faint size-3" />
          </button>
        </div>
      </section>

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
                className="cursor-pointer shrink-0"
              >
                <ContentCategoryCard category={category} />
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
      <section className="px-5 mt-6 flex flex-col items-start gap-3">
        <h2 className="typo-body-xl-bold text-main">위치안내</h2>
        <div className="w-full flex flex-col overflow-hidden rounded-[14px] border border-[#e5e7eb]">
          <img
            src={LocationMapPlaceholder}
            alt="위치 지도"
            className="h-[140px] w-full shrink-0 self-stretch bg-[#eceff2] object-cover"
          />
          <div className="flex items-center justify-between gap-3 shrink-0 bg-white px-4 py-3.5">
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[#111] text-sm font-semibold leading-[21px] break-words">
                {ex.location?.placeName}
              </p>
              {/* TODO: 도로명주소 API 필드 추가되면 교체 (현재 하드코딩) */}
              <p className="text-[#9ca3af] text-xs font-normal leading-[18px]">
                서울특별시 동작구 흑석로 84
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 flex items-center justify-center rounded-[10px] border border-[#e5e7eb] pt-[6.5px] pr-[12.414px] pb-[7.5px] pl-[13px] text-[#374151] text-xs font-medium leading-[18px]"
            >
              지도보기
            </button>
          </div>
        </div>
      </section>

      {/* 주최·문의 */}
      <section className="px-5 mt-6 pb-6">
        <h2 className="typo-body-xl-bold text-main mb-3">주최 · 문의</h2>
        <div className="flex flex-col gap-1.5">
          {ex.organization && (
            <div className="flex items-start gap-2 typo-body-sm-regular text-main">
              <span className="text-faint w-6 shrink-0">주최</span>
              <span>{ex.organization}</span>
            </div>
          )}
          {ex.qnaAccount && (
            <div className="flex items-start gap-2 typo-body-sm-regular text-main">
              <span className="text-faint w-6 shrink-0">문의</span>
              <span>{ex.qnaAccount}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

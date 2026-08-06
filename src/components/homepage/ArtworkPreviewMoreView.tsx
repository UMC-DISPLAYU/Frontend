import { useEffect, useState } from 'react';

import { ChevronLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { ArtworkPreviewItemDto } from '@/api/dto';
import { FILTER_CONFIG } from '@/components/search/filterOptions';
import { cn } from '@/utils/cn';

// '전체' 옵션을 제외한 순수 카테고리 필터 목록
const CATEGORY_OPTIONS = FILTER_CONFIG.전시분야.options.filter((opt) => opt.value !== null);
const CATEGORY_LABELS = CATEGORY_OPTIONS.map((opt) => opt.label);

type Props = {
  items: ArtworkPreviewItemDto[];
  onClose?: () => void;
};

// 각 작품의 카테고리를 추출/매핑하는 헬퍼 함수
function getItemCategory(item: ArtworkPreviewItemDto, index: number): string {
  for (const cat of CATEGORY_LABELS) {
    if (item.artworkName.includes(cat) || item.exhibitionInfo?.exhibitionTitle?.includes(cat)) {
      return cat;
    }
  }
  // 목 데이터에 카테고리명이 직접 없는 경우 인덱스 기반으로 균등 할당
  return CATEGORY_LABELS[index % CATEGORY_LABELS.length];
}

export function ArtworkPreviewMoreView({ items, onClose }: Props) {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 마운트 시 최상단으로 자동 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 카테고리 다중 선택 토글 핸들러
  const handleToggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label],
    );
  };

  // 개별 카테고리 삭제
  const handleRemoveCategory = (label: string) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== label));
  };

  // 전체 선택 해제 (초기화)
  const handleResetCategories = () => {
    setSelectedCategories([]);
  };

  // 선택한 카테고리에 맞는 작품만 실시간 동적 필터링
  const filteredItems =
    selectedCategories.length > 0
      ? items.filter((item, idx) => {
          const itemCategory = getItemCategory(item, idx);
          return selectedCategories.includes(itemCategory);
        })
      : items;

  return (
    <div className="w-full max-w-md mx-auto bg-page min-h-dvh overflow-x-hidden pt-4 pb-4">
      {/* 상단 네비게이션 & 헤더 */}
      <div className="px-5 mb-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center size-8 -ml-1.5 mb-2 cursor-pointer rounded-full hover:bg-box100 transition-colors"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="size-6 text-main" />
          </button>
        )}
        <h1 className="typo-body-2xl-bold text-main">작품 미리보기</h1>
        <p className="typo-body-xs-regular text-hint mt-1">
          다양한 전시 작품을 한곳에서 발견하고 감상해보세요.
        </p>
      </div>

      {/* 전시분야 카테고리 칩 필터 섹션 */}
      <div className="px-5 mb-4 flex flex-col gap-2.5">
        {/* 칩 스크롤 영역 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none select-none">
          {CATEGORY_OPTIONS.map((opt) => {
            const isSelected = selectedCategories.includes(opt.label);
            return (
              <button
                key={opt.label}
                type="button"
                data-property-1={isSelected ? 'on' : 'off'}
                onClick={() => handleToggleCategory(opt.label)}
                className={cn(
                  'shrink-0 px-2.5 py-1.5 rounded-sm shadow-[4px_4px_12px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] flex justify-center items-center gap-2.5 cursor-pointer transition-all bg-transparent',
                  isSelected ? 'outline-filter-border-on' : 'outline-filter-border-off',
                )}
              >
                <span
                  className={
                    isSelected
                      ? 'typo-body-xs-bold text-filter-text-on'
                      : 'typo-body-xs-regular text-filter-text-off'
                  }
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 선택된 다중 필터 태그 & 초기화 버튼 */}
        {selectedCategories.length > 0 && (
          <div className="w-full flex justify-between items-center select-none">
            <div className="flex items-center gap-2.5 flex-wrap">
              {selectedCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="flex items-center gap-1 cursor-pointer group"
                >
                  <span className="typo-body-xs-regular text-sub700 group-hover:text-main">
                    {cat}
                  </span>
                  <X className="size-3 text-sub700 group-hover:text-main" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetCategories}
              className="shrink-0 typo-body-xs-regular text-sub700 underline cursor-pointer hover:text-main"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      {/* 작품 목록 */}
      <div className="grid grid-cols-2 gap-2.5 px-5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <article
              key={item.artworkId}
              onClick={() => navigate(`/artwork/${item.artworkId}`)}
              className="relative h-64 overflow-hidden rounded-2xl bg-box200 cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all group"
            >
              {item.artworkImageUrl ? (
                <img
                  src={item.artworkImageUrl}
                  alt={item.artworkName}
                  className="h-full w-full object-cover select-none group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-box200" />
              )}
              {/* 하단 어두운 그라데이션 */}
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

              {/* 카드 텍스트 */}
              <div className="absolute left-3.5 right-3.5 bottom-3.5 flex flex-col gap-0.5 pointer-events-none">
                <p className="typo-body-md-bold text-white line-clamp-1">{item.artworkName}</p>
                <p className="typo-body-xs-regular text-zinc-300 truncate">
                  {item.artistName || item.exhibitionInfo?.exhibitionTitle}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-hint typo-body-sm-regular">
            해당 카테고리의 작품이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

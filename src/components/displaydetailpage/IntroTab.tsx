import { useState } from 'react';

import { ChevronRight, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { DisplayContentCategoryDto, DisplayDetailDto } from '@/api/dto/display.dto';

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
      className="shrink-0 rounded-xl overflow-hidden bg-box200 relative cursor-pointer"
      style={{ width: 362, height: 152 }}
    >
      {firstImage ? (
        <img src={firstImage.imageUrl} alt={category.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-neutral-300" />
      )}
      {/* 왼쪽 하단 그라데이션 + 텍스트 오버레이 */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent rounded-xl" />
      <div className="absolute bottom-3 left-3 flex flex-col gap-0.5">
        <p className="typo-body-md-bold text-white leading-tight">{category.name}</p>
        {(category.description || count > 0) && (
          <p className="typo-body-xxs-regular text-white/80">
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
      <section className="px-5 pt-6 pb-4.5">
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
        <section className="py-5 bg-box200">
          <div className="flex items-center justify-between px-5 mb-4">
            <h2 className="typo-body-xl-bold text-main">전시콘텐츠</h2>
            <button
              type="button"
              onClick={handleGoToContents}
              className="flex items-center gap-0.5 typo-body-xs-regular text-faint cursor-pointer"
            >
              <span>더보기</span>
              <ChevronRight className="text-faint size-3" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 px-5" style={{ scrollbarWidth: 'none' }}>
            {ex.contentCategories.map((category) => (
              <div
                key={category.categoryId}
                onClick={handleGoToContents}
                className="cursor-pointer"
              >
                <ContentCategoryCard category={category} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 유의사항 */}
      {ex.note && (
        <section className="px-5 p-6">
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

      {/* 주최·문의 */}
      <section className="px-5 pb-6">
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

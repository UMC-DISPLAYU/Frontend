import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import type { DisplayContentCategoryDto } from '@/api/dto/display.dto';
import DUfontlogo from '@/assets/DUfontlogo.svg';
import { ErrorView, LoadingView } from '@/components/common';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { parseDisplayId } from '@/utils/parseDisplayId';

export function DisplayContentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const displayId = parseDisplayId(id);

  const [selectedCategory, setSelectedCategory] = useState<DisplayContentCategoryDto | null>(null);

  const { data: display, isPending, isError } = useDisplayDetail(displayId ?? 0);

  if (isPending) {
    return <LoadingView message="전시 콘텐츠를 불러오는 중..." />;
  }

  if (isError || !display || displayId === null) {
    return (
      <ErrorView
        title="전시 정보를 찾을 수 없습니다"
        message="요청하신 전시 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate(-1);
    }
  };

  // 선택된 카테고리의 사진들을 아래로 나열하는 뷰
  if (selectedCategory) {
    return (
      <div className="w-full max-w-md mx-auto min-h-dvh bg-page flex flex-col">
        {/* 헤더 */}
        <header className="sticky top-0 z-20 bg-page h-14 px-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="flex items-center justify-center p-1 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={30} strokeWidth={1.5} className="text-logo" />
          </button>
          <img src={DUfontlogo} alt="DU Logo" className="h-6 object-contain" />
          <div className="w-6" />
        </header>

        {/* 선택된 카테고리 상단 타이틀 & 세로형 사진 목록 */}
        <main className="flex flex-col flex-1 pb-10">
          <div className="px-5 pt-6 pb-6 flex flex-col gap-1">
            <h1 className="typo-body-2xl-bold text-main">{selectedCategory.name}</h1>
            {selectedCategory.description && (
              <p className="typo-body-sm-regular text-faint">{selectedCategory.description}</p>
            )}
          </div>

          <div className="flex flex-col w-full gap-0">
            {selectedCategory.contents.map((item) => (
              <div key={item.contentId} className="w-full bg-box overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={selectedCategory.name}
                  className="w-full h-auto object-cover block"
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // 기본 전시 콘텐츠 카테고리 목록 뷰
  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-page h-14 px-5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="flex items-center justify-center p-1 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={30} strokeWidth={1.5} className="text-logo" />
        </button>
        <img src={DUfontlogo} alt="DU Logo" className="h-6 object-contain" />
        <div className="w-6" />
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="px-5 py-6 flex flex-col gap-6 flex-1">
        {/* 헤더 타이틀 */}
        <div className="flex flex-col gap-1">
          <h1 className="typo-body-2xl-bold text-main">전시 콘텐츠</h1>
          <p className="typo-body-sm-regular text-faint">
            전시의 분위기와 준비 과정을 사진으로 확인해보세요.
          </p>
        </div>

        {/* 카테고리 별 리스트 */}
        <div className="flex flex-col gap-3">
          {display.contentCategories.map((category) => {
            const firstImg = category.contents[0]?.imageUrl;
            const count = category.contents.length;

            return (
              <button
                key={category.categoryId}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-label={`${category.name} 사진 보기`}
                className="flex items-center justify-between cursor-pointer group w-full text-left"
              >
                {/* 좌측 카테고리 썸네일 카드 */}
                <div className="w-72 h-36 relative rounded-xl overflow-hidden bg-box shadow-xs shrink-0">
                  {firstImg ? (
                    <img
                      src={firstImg}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-300" />
                  )}
                  {/* 오버레이 & 텍스트 */}
                  <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/80" />
                  <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 right-3">
                    <p className="typo-body-md-bold text-white leading-snug">{category.name}</p>
                    <p className="typo-body-xxs-regular text-white/80 truncate">
                      {category.description ? `${category.description} · ` : ''}
                      {count}개
                    </p>
                  </div>
                </div>

                {/* 우측 아이콘 및 사진 수 표시 */}
                <div className="w-12 h-36 flex flex-col justify-center items-center gap-1.5 text-center">
                  <ChevronRight
                    size={30}
                    strokeWidth={1.5}
                    className="text-main group-hover:translate-x-0.5 transition-transform"
                  />
                  <span className="typo-body-sm-regular text-faint">사진 {count}장</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

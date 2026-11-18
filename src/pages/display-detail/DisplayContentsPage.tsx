import { type RefObject, useEffect, useRef, useState } from 'react';

import { useParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { NotFoundView } from '@/components/error-page';
import { Skeleton, SkeletonList, SkeletonText } from '@/components/ui/Skeleton';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getErrorMessage, isNotFoundError } from '@/utils/error';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';
import { parseDisplayId } from '@/utils/parseDisplayId';

/* 프로토타입 exhibition.html 콘텐츠 보기(11-15 U-152): 사진은 폭 끝까지 · 원래 비율 · 사이 4, 768px 이상은 가운데 560 */
const COLUMN = 'w-full tablet:mx-auto tablet:w-[min(560px,100%)]';
// 사진을 받기 전 비율을 모를 때 자리(프로토타입 img width 600 · height 800)
const FALLBACK_RATIO = '600 / 800';

type DisplayContentsPageProps = {
  /* 전시 미리보기에서 연 콘텐츠(/exhibition/:displayId/preview/contents)의 전시 번호와 뒤로가기 */
  previewDisplayId?: string;
  onBack?: () => void;
};

/* 사진을 보는 동안만 오른쪽 아래에 몇 번째 사진인지 띄운다. 스크롤을 시작해야 나타나고, 사진을 다 지나면 숨는다 */
function usePhotoCounter(
  feedRef: RefObject<HTMLDivElement>,
  headerRef: RefObject<HTMLElement>,
  resetKey: unknown,
) {
  // 다른 섹션으로 넘어가면 다시 스크롤할 때까지 숨긴다
  const [state, setState] = useState({ key: resetKey, index: -1 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const photos = feedRef.current?.children;
      if (!photos || photos.length < 2) return;
      const top = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const middle = top + (window.innerHeight - top) * 0.5;
      let index = -1;
      Array.from(photos).forEach((photo, photoIndex) => {
        if (photo.getBoundingClientRect().top < middle) index = photoIndex;
      });
      const isPastLast = photos[photos.length - 1].getBoundingClientRect().bottom < top;
      setState({ key: resetKey, index: isPastLast ? -1 : index });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [feedRef, headerRef, resetKey]);

  return state.key === resetKey ? state.index : -1;
}

export function DisplayContentsPage({ previewDisplayId, onBack }: DisplayContentsPageProps = {}) {
  const flowBack = useFlowBack();
  const goBack = onBack ?? (() => flowBack());
  const { id } = useParams<{ id: string }>();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const displayId = parseDisplayId(previewDisplayId ?? id);
  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);
  const { showSkeleton, skeletonProps } = useSkeleton(isPending);
  const headerRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const categoryParam = searchParams.get('category');
  const categories = display?.contentCategories ?? [];
  // 주소만 입력해 들어오면 첫 콘텐츠를 보여주고, 없는 콘텐츠 번호면 다른 콘텐츠로 바꾸지 않고 없다고 알린다
  const categoryIndex =
    categoryParam === null
      ? 0
      : categories.findIndex((item) => item.categoryId === Number(categoryParam));
  const category = categories[categoryIndex];
  const nextCategory = categories[categoryIndex + 1];
  const current = usePhotoCounter(feedRef, headerRef, category?.categoryId);

  // 공개 전 전시를 공개 주소로 열면 팀원이어도 404 다(미리보기 주소로만 본다)
  const isHiddenOnPublic = !previewDisplayId && display !== undefined && isPreviewDisplay(display);

  // 삭제된 전시 · 없는 콘텐츠 번호는 404. 그 밖에 다시 불러오기만 실패하면 받아 둔 내용을 그대로 보여준다
  if (displayId === null || isNotFoundError(error) || isHiddenOnPublic || (display && !category)) {
    return <NotFoundView />;
  }
  if (!isPending && !display) {
    return (
      <ErrorView
        message={getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')}
        onRetry={() => void refetch()}
      />
    );
  }

  const photos = category?.contents.slice().sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
  const isReady = Boolean(category) && !showSkeleton;
  const nextCover = nextCategory?.contents.reduce<
    (typeof nextCategory.contents)[number] | undefined
  >((first, item) => (!first || item.sortOrder < first.sortOrder ? item : first), undefined);

  // 다음 섹션은 같은 화면에서 이어 본다(뒤로가기는 전시 상세로)
  const openNext = () => {
    if (!nextCategory) return;
    replaceSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('category', String(nextCategory.categoryId));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="min-h-dvh bg-primary-white text-[#18181b]">
      <header
        ref={headerRef}
        className="sticky top-0 z-20 flex min-h-14 items-center gap-1 bg-primary-white pt-[max(6px,env(safe-area-inset-top))] pr-5 pb-1.5 pl-2 tablet:px-[max(8px,calc((100%-560px)/2-12px))]"
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={goBack}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-circle transition-[background-color,scale] duration-fast ease-standard hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-focus active:scale-96"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6 fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        {isReady ? (
          <h1 className="min-w-0 truncate text-[16px] leading-[1.4] font-semibold tracking-[-0.03em]">
            {category?.name}
          </h1>
        ) : (
          <SkeletonText className="typography-body-xl-semibold w-32" />
        )}
      </header>

      <main
        aria-label="콘텐츠 사진"
        className="pb-[max(40px,env(safe-area-inset-bottom))]"
        {...skeletonProps}
      >
        {isReady && category ? (
          <>
            <div ref={feedRef} className={`${COLUMN} grid gap-1`}>
              {photos.map((photo, index) => (
                <OptimizedImage
                  key={photo.contentId}
                  src={photo.imageUrl}
                  displayWidth={1080}
                  alt={`${category.name} ${index + 1}/${photos.length}`}
                  loading={index > 1 ? 'lazy' : 'eager'}
                  draggable={false}
                  style={{
                    // auto: 사진을 받으면 실제 비율을 따른다(프로토타입 img width · height 속성과 같은 동작)
                    aspectRatio: `auto ${
                      photo.width > 0 && photo.height > 0
                        ? `${photo.width} / ${photo.height}`
                        : FALLBACK_RATIO
                    }`,
                  }}
                  className="block h-auto w-full bg-[#f4f4f5] select-none [-webkit-user-drag:none]"
                />
              ))}
            </div>

            {nextCategory && (
              <button
                type="button"
                onClick={openNext}
                className="group mx-5 mt-8 flex w-[calc(100%-40px)] cursor-pointer items-center gap-3 pt-5 text-left focus-visible:outline-2 focus-visible:outline-focus tablet:mx-auto tablet:w-[min(560px,100%)]"
              >
                <OptimizedImage
                  src={nextCover?.imageUrl}
                  displayWidth={96}
                  alt=""
                  className="h-16 w-12 shrink-0 bg-[#f4f4f5] object-cover"
                />
                <b className="min-w-0 flex-1 truncate text-[16px] font-semibold tracking-[-0.03em] group-hover:underline group-hover:underline-offset-3">
                  {nextCategory.name}
                </b>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 shrink-0 fill-none stroke-[#71717b] stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
                >
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            )}

            {photos.length > 1 && (
              <span
                aria-hidden="true"
                className={`pointer-events-none fixed right-5 bottom-[max(20px,env(safe-area-inset-bottom))] z-5 inline-flex h-6 items-center rounded-circle bg-black/45 px-2 text-[12px] font-medium tracking-[-0.03em] text-white tabular-nums backdrop-blur-[6px] transition-opacity duration-fast ease-out ${current >= 0 ? 'opacity-100' : 'opacity-0'}`}
              >
                {Math.max(current, 0) + 1} / {photos.length}
              </span>
            )}
          </>
        ) : (
          <div className={`${COLUMN} grid gap-1`}>
            <SkeletonList count={2}>
              {() => <Skeleton className="aspect-3/4 w-full" />}
            </SkeletonList>
          </div>
        )}
      </main>
    </div>
  );
}

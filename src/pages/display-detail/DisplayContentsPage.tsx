import { ChevronLeft } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';

import { ErrorView } from '@/components/common';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import { getErrorMessage } from '@/utils/error';
import { parseDisplayId } from '@/utils/parseDisplayId';

/* 피그마 메모: 흰 화면에서 사진이 위에서 아래로 이어진다. 폭 362(좌우 20) · 사이 12 · 반경 12 · 3:4 */
const COLUMN = 'mx-auto w-full max-w-140';
const PHOTO_FRAME = 'aspect-3/4 w-full overflow-hidden rounded-12 bg-tertiary';

export function DisplayContentsPage() {
  const flowBack = useFlowBack();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const displayId = parseDisplayId(id);
  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);

  const categoryParam = searchParams.get('category');
  const categories = display?.contentCategories ?? [];
  // 주소만 입력해 들어오면 첫 콘텐츠를 보여주고, 없는 콘텐츠 번호면 다른 콘텐츠로 바꾸지 않고 없다고 알린다
  const category =
    categoryParam === null
      ? categories[0]
      : categories.find((item) => item.categoryId === Number(categoryParam));

  // 다시 불러오기만 실패하면 받아 둔 내용을 그대로 보여준다
  if (displayId === null || (!isPending && (!display || !category))) {
    return (
      <ErrorView
        message={
          error
            ? getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')
            : '전시 콘텐츠를 찾을 수 없어요'
        }
        onRetry={error ? () => void refetch() : () => flowBack()}
        retryLabel={error ? '다시 시도' : '뒤로가기'}
      />
    );
  }

  const photos = category?.contents.slice().sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  return (
    <div className="min-h-dvh bg-primary-white">
      <header className="sticky top-0 z-20 border-b border-bg-tertiary bg-primary-white pt-safe-area-top pr-gutter pb-1.5 pl-2 tablet:px-gutter">
        <div className={`${COLUMN} flex min-h-11 items-center gap-1 tablet:-translate-x-3`}>
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => flowBack()}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-94"
          >
            <ChevronLeft aria-hidden="true" size={24} strokeWidth={1.7} />
          </button>
          {category ? (
            <div className="grid min-w-0">
              <h1 className="typography-body-xl-semibold truncate text-primary">{category.name}</h1>
              <p className="typography-body-md-medium truncate text-tertiary">{display?.title}</p>
            </div>
          ) : (
            <div className="grid gap-1">
              <Skeleton className="h-5 w-32 rounded-4" />
              <Skeleton className="h-4 w-24 rounded-4" />
            </div>
          )}
        </div>
      </header>

      <main
        aria-label="콘텐츠 사진"
        className={`${COLUMN} grid gap-3 px-gutter pt-5 pb-[max(40px,env(safe-area-inset-bottom))] tablet:px-0`}
      >
        {category ? (
          photos.map((photo, index) => (
            <OptimizedImage
              key={photo.contentId}
              src={photo.imageUrl}
              displayWidth={1080}
              alt={`${category.name} ${index + 1}/${photos.length}`}
              loading={index > 1 ? 'lazy' : 'eager'}
              draggable={false}
              skeleton
              frameClassName={PHOTO_FRAME}
              className="size-full object-cover select-none"
            />
          ))
        ) : (
          <SkeletonList count={2}>{() => <Skeleton className={PHOTO_FRAME} />}</SkeletonList>
        )}
      </main>
    </div>
  );
}

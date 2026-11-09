import type { DisplayDetailDto } from '@/api/dto';
import { Skeleton } from '@/components/ui/Skeleton';
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import { cn } from '@/utils/cn';

import { DisplayBottomBar, DisplayInlineActions, DisplaySaveButton } from './DisplayActions';
import { DisplayBackButton } from './DisplayBackButton';
import { displayPanelId, displayTabId, isPreviewDisplay } from './displayDetail.utils';
import { DisplaySummary } from './DisplaySummary';
import { DisplayTabNav } from './DisplayTabNav';
import { DisplayTopBar } from './DisplayTopBar';
import { IntroPanel } from './IntroPanel';
import { PosterCarousel } from './PosterCarousel';
import { PreviewReviewsPanel, ReviewsPanel } from './ReviewsPanel';
import { useDisplayDetailTab } from './useDisplayDetailTab';
import { WorksPanel } from './WorksPanel';

/*
 * 프로토타입 반응형
 * - 600px 미만: 모바일. 포스터 → 정보 → 탭, 뒤로가기는 화면을 따라 내려온다
 * - 600~767px: 포스터 · 본문을 가운데 좁은 단으로
 * - 768~899px: 위에 서비스 헤더(64)가 생기고, 탭 줄 · 뒤로가기는 그 아래에 붙는다
 * - 900px 이상: 왼쪽 포스터 · 오른쪽 정보 2단, 뒤로가기는 없다(미리보기만 포스터 위에 둔다)
 */
const LAYOUT =
  'mx-auto w-full max-w-list desktop:grid desktop:grid-cols-[minmax(320px,40%)_minmax(0,1fr)] desktop:items-start desktop:gap-x-14 desktop:px-gutter desktop:pt-8 desktop:pb-20';
const SHEET =
  'min-w-0 min-[37.5rem]:mx-auto min-[37.5rem]:max-w-160 desktop:mx-0 desktop:max-w-170';

/* sticky 요소(탭 줄 · 뒤로가기 · 포스터)가 붙는 위치. 미리보기 띠(40)와 768px 이상 헤더(64)를 더한 값 */
const stickyTop = (isPreview: boolean) =>
  isPreview
    ? '[--detail-top:2.5rem] tablet:[--detail-top:6.5rem]'
    : '[--detail-top:0rem] tablet:[--detail-top:4rem]';

type Props = {
  display: DisplayDetailDto;
  onBack: () => void;
};

export function DisplayDetailView({ display, onBack }: Props) {
  const { activeTab, selectTab, sentinelRef } = useDisplayDetailTab();
  const isPreview = isPreviewDisplay(display);

  const posters = (display.images ?? [])
    .slice()
    .sort((a, b) => Number(b.isThumbnail) - Number(a.isThumbnail) || a.sortOrder - b.sortOrder)
    .map((image) => image.imageUrl)
    .filter(Boolean);
  const share = {
    shareTitle: display.title,
    shareDescription: display.subtitle ?? undefined,
    shareImageUrl: posters[0],
    disabled: isPreview,
  };
  const saveButton = (
    <DisplaySaveButton
      displayId={display.displayId}
      saved={display.isArchived ?? false}
      disabled={isPreview}
    />
  );

  return (
    <div className={cn('min-h-dvh bg-primary-white', stickyTop(isPreview))}>
      {isPreview && (
        <div
          role="status"
          className="typography-body-md-regular sticky top-0 z-40 flex min-h-10 items-center justify-center gap-2 bg-primary-black px-gutter py-2 text-center text-interactive-inverse"
        >
          <b className="typography-body-md-semibold shrink-0 rounded-circle bg-primary-white px-2 py-px text-primary">
            미리보기
          </b>
          <span>공개 전 모습이에요. 저장·좋아요·후기 작성은 할 수 없어요</span>
        </div>
      )}

      <DisplayTopBar className={isPreview ? 'top-10' : 'top-0'} />

      {/*
       * 900px 미만: 높이 0인 sticky 칸이라 처음엔 포스터 위(20, 20)에 있다가,
       * 스크롤하면 화면 맨 위(768px 이상은 헤더 아래)에 붙어 탭 줄 왼쪽에 앉는다(프로토타입 11-09)
       */}
      <div className="sticky top-[calc(var(--detail-top)-max(20px,env(safe-area-inset-top)))] z-30 h-0 desktop:hidden">
        <DisplayBackButton
          onBack={onBack}
          className="absolute top-[max(20px,env(safe-area-inset-top))] left-5"
        />
      </div>

      <div className={LAYOUT}>
        <PosterCarousel
          images={posters.length > 0 ? posters : [FALLBACK_POSTER_IMAGE]}
          title={display.title}
          onBack={onBack}
          isPreview={isPreview}
        />

        <div className={SHEET}>
          <DisplaySummary
            display={display}
            isPreview={isPreview}
            actions={<DisplayInlineActions saveButton={saveButton} {...share} />}
          />

          <DisplayTabNav activeTab={activeTab} onTabChange={selectTab} sentinelRef={sentinelRef} />

          <div
            id={displayPanelId('intro')}
            role="tabpanel"
            aria-labelledby={displayTabId('intro')}
            hidden={activeTab !== 'intro'}
            className="animate-fade-in"
          >
            <IntroPanel display={display} />
          </div>
          {activeTab === 'works' && (
            <div
              id={displayPanelId('works')}
              role="tabpanel"
              aria-labelledby={displayTabId('works')}
              className="animate-fade-in"
            >
              <WorksPanel
                displayId={display.displayId}
                teamMembers={display.teamMembers}
                isPreview={isPreview}
              />
            </div>
          )}
          {activeTab === 'reviews' && (
            <div
              id={displayPanelId('reviews')}
              role="tabpanel"
              aria-labelledby={displayTabId('reviews')}
              className="animate-fade-in"
            >
              {isPreview ? <PreviewReviewsPanel /> : <ReviewsPanel display={display} />}
            </div>
          )}
        </div>
      </div>

      {/* 후기 탭은 아래에 후기 입력바가 붙으므로 저장 바를 띄우지 않는다 */}
      {activeTab !== 'reviews' && <DisplayBottomBar saveButton={saveButton} {...share} />}
    </div>
  );
}

export function DisplayDetailSkeleton() {
  return (
    <div className="min-h-dvh bg-primary-white">
      <DisplayTopBar className="top-0" />
      <div className={LAYOUT}>
        <Skeleton className="aspect-402/568 min-[37.5rem]:mx-auto min-[37.5rem]:mt-6 min-[37.5rem]:max-w-120 min-[37.5rem]:rounded-16 desktop:mt-0 desktop:max-w-none" />
        <div className={SHEET}>
          <div className="flex flex-col gap-2 px-gutter py-6 desktop:px-0 desktop:pt-0">
            <Skeleton className="h-7 w-2/3 rounded-4" />
            <Skeleton className="h-5 w-1/2 rounded-4" />
            <Skeleton className="mt-3 h-19 w-40 rounded-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

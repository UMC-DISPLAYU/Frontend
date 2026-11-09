import type { DisplayDetailDto } from '@/api/dto';
import {
  DetailBackButton,
  DetailPreviewBanner,
  detailStickyTopClass,
  DetailTabNav,
  DetailTopBar,
  useDetailTab,
} from '@/components/common/detail';
import { Skeleton } from '@/components/ui/Skeleton';
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import { cn } from '@/utils/cn';
import { isPreviewDisplay } from '@/utils/isPreviewDisplay';

import { DisplayBottomBar, DisplayInlineActions, DisplaySaveButton } from './DisplayActions';
import {
  DISPLAY_DETAIL_TABS,
  type DisplayDetailTabKey,
  displayPanelId,
  displayTabId,
} from './displayDetail.utils';
import { DisplaySummary } from './DisplaySummary';
import { IntroPanel } from './IntroPanel';
import { PosterCarousel } from './PosterCarousel';
import { PreviewReviewsPanel, ReviewsPanel } from './ReviewsPanel';
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

const TAB_LABEL: Record<DisplayDetailTabKey, string> = {
  intro: '소개',
  works: '작품',
  reviews: '후기',
};

type Props = {
  display: DisplayDetailDto;
  onBack: () => void;
};

export function DisplayDetailView({ display, onBack }: Props) {
  const { activeTab, selectTab, sentinelRef, isStuck } = useDetailTab(DISPLAY_DETAIL_TABS);
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
    <div className={cn('min-h-dvh bg-primary-white', detailStickyTopClass(isPreview))}>
      {isPreview && (
        <DetailPreviewBanner message="공개 전 모습이에요. 저장·좋아요·후기 작성은 할 수 없어요" />
      )}

      <DetailTopBar className={isPreview ? 'top-10' : 'top-0'} />

      {/*
       * 900px 미만: 높이 0인 sticky 칸이라 처음엔 포스터 위(20, 20)에 있다가,
       * 스크롤하면 화면 맨 위(768px 이상은 헤더 아래)에 붙어 탭 줄 왼쪽에 앉는다(프로토타입 11-09)
       */}
      <div className="sticky top-[calc(var(--detail-top)-max(20px,env(safe-area-inset-top)))] z-30 h-0 desktop:hidden">
        <DetailBackButton
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

          <DetailTabNav
            tabs={DISPLAY_DETAIL_TABS}
            labels={TAB_LABEL}
            label="전시 상세"
            tabId={displayTabId}
            panelId={displayPanelId}
            activeTab={activeTab}
            onTabChange={selectTab}
            sentinelRef={sentinelRef}
            isStuck={isStuck}
          />

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
          {/*
           * 후기 패널은 등장 애니메이션을 두지 않는다. fade-in(fill both)이 끝나도 쌓임 맥락이 남아
           * 안의 고정 입력바가 sticky 탭 줄 아래로 깔린다(작품 방명록과 같게)
           */}
          {activeTab === 'reviews' && (
            <div
              id={displayPanelId('reviews')}
              role="tabpanel"
              aria-labelledby={displayTabId('reviews')}
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
      <DetailTopBar className="top-0" />
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

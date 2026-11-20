import type { DisplayDetailDto } from '@/api/dto';
import {
  DetailPreviewBanner,
  detailStickyTopClass,
  DetailTabNav,
  DetailTopBar,
  useDetailTab,
} from '@/components/common/detail';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import { cn } from '@/utils/cn';
import { isVideoMedia, toDisplayImageCardUrl } from '@/utils/displayMedia';

import { DisplayBottomBar, DisplayInlineActions, DisplaySaveButton } from './DisplayActions';
import {
  type DisplayDetailTabKey,
  displayPanelId,
  displayTabId,
  getDisplayDetailTabs,
  hasDisplayWorks,
} from './displayDetail.utils';
import { DisplaySummary } from './DisplaySummary';
import { IntroPanel } from './IntroPanel';
import { PosterCarousel } from './PosterCarousel';
import { PreviewReviewsPanel, ReviewsPanel } from './ReviewsPanel';
import { WorksPanel } from './WorksPanel';

/*
 * 프로토타입 반응형
 * - 600px 미만: 모바일. 포스터 → 정보 → 탭
 * - 600~767px: 포스터 · 본문을 가운데 좁은 단으로
 * - 768~899px: 위에 서비스 헤더(64)가 생기고, 탭 줄은 그 아래에 붙는다
 * - 900px 이상: 왼쪽 포스터 · 오른쪽 정보 2단
 * 뒤로가기 버튼은 두지 않고 브라우저 뒤로가기에 맡긴다(프로토타입 11-15 U-149, 미리보기 포함)
 * 900px 이상 아래 여백 80은 그리드가 아니라 오른쪽 정보 칸에 둔다. 그리드에 두면 포스터가 붙는 범위(그리드 줄)가
 * 페이지 끝보다 80 먼저 끝나, 끝까지 내렸을 때 포스터가 위로 밀려 올라간다
 * 최대 폭 1240 · 좌우 여백 32는 공용 컨테이너(max-w-list · px-gutter)가 아니라 프로토타입 값이다
 */
const LAYOUT =
  'mx-auto w-full max-w-310 desktop:grid desktop:grid-cols-[minmax(320px,40%)_minmax(0,1fr)] desktop:items-start desktop:gap-x-14 desktop:px-8 desktop:pt-8';
const SHEET =
  'min-w-0 min-[37.5rem]:mx-auto min-[37.5rem]:max-w-160 desktop:mx-0 desktop:max-w-170 desktop:pb-20';

const TAB_LABEL: Record<DisplayDetailTabKey, string> = {
  intro: '소개',
  works: '작품',
  reviews: '후기',
};

type Props = {
  display: DisplayDetailDto;
  /*
   * 전시 작업에서 연 미리보기(/exhibition/:displayId/preview). 공개 전 모습(안내 띠, 저장 · 좋아요 · 후기 막기)은
   * 이 미리보기에서만 보이고, 작품 · 콘텐츠를 누르면 미리보기 안에서 연다.
   * 공개 여부와 상관없이 이 주소에서만 미리보기로 보이고, 공개 전 전시의 공개 주소(/display/:id)는 404 다
   */
  previewMode?: boolean;
};

export function DisplayDetailView({ display, previewMode = false }: Props) {
  /*
   * 소개 · 작품 탭은 비면 빠지고 남은 첫 탭이 기본이 된다. 주소에 남은 빠진 탭(?tab=)도 첫 탭으로 본다(useDetailTab).
   * 작품 목록은 페이지가 상세와 함께 기다려 두므로, 받은 뒤 작품 탭이 빠지며 탭 줄이 바뀌지 않는다
   */
  const { data: works } = useDisplayArtworks(display.displayId);
  // 공개 시점 전이어도 서버가 작품 · 콘텐츠를 그대로 주므로 일반 상세에서만 숨긴다. 미리보기(팀원)는 다 보인다
  const showWorks = previewMode || display.artworkContentVisible !== false;
  const introDisplay =
    previewMode || display.exhibitionContentVisible !== false
      ? display
      : { ...display, contentCategories: [] };
  const tabs = getDisplayDetailTabs(introDisplay, {
    hasWorks: showWorks && hasDisplayWorks(works),
  });
  const hasIntro = tabs.includes('intro');
  const { activeTab, selectTab, sentinelRef } = useDetailTab(tabs);

  // 프로토타입 postFresh: 후기를 올렸을 때 탭 줄 아래로 내려가 있으면 탭 줄 자리로 부드럽게 올라간다
  const scrollToTabs = () => {
    const sentinel = sentinelRef.current;
    const nav = sentinel?.nextElementSibling;
    if (!sentinel || !nav) return;
    const stickyTop = parseFloat(getComputedStyle(nav).top) || 0;
    const top = sentinel.getBoundingClientRect().top + window.scrollY - stickyTop;
    if (window.scrollY <= top) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  const posters = (display.images ?? [])
    .slice()
    .sort((a, b) => Number(b.isThumbnail) - Number(a.isThumbnail) || a.sortOrder - b.sortOrder)
    .map((image) => ({
      src: toDisplayImageCardUrl(image),
      videoSrc: isVideoMedia(image) ? image.imageUrl : undefined,
    }))
    .filter((poster) => poster.src);
  const share = {
    shareTitle: display.title,
    disabled: previewMode,
  };
  const saveButton = (
    <DisplaySaveButton
      displayId={display.displayId}
      saved={display.isArchived ?? false}
      disabled={previewMode}
    />
  );

  return (
    <div className={cn('min-h-dvh bg-primary-white', detailStickyTopClass(previewMode))}>
      {previewMode && (
        <DetailPreviewBanner message="공개 전 모습이에요. 저장·좋아요·후기 작성은 할 수 없어요" />
      )}

      <DetailTopBar
        className={previewMode ? 'top-[var(--preview-banner-height,2.5rem)]' : 'top-0'}
      />

      <div className={LAYOUT}>
        <PosterCarousel
          posters={posters.length > 0 ? posters : [{ src: FALLBACK_POSTER_IMAGE }]}
          title={display.title}
          representativeFit={{
            crop: display.posterCrop,
            fit: display.posterFit,
            edgeColor: display.posterEdgeColor,
          }}
        />

        <div className={SHEET}>
          <DisplaySummary
            display={display}
            isPreview={previewMode}
            actions={<DisplayInlineActions saveButton={saveButton} {...share} />}
          />

          <DetailTabNav
            tabs={tabs}
            labels={TAB_LABEL}
            label="전시 상세"
            tabId={displayTabId}
            panelId={displayPanelId}
            activeTab={activeTab}
            onTabChange={selectTab}
            sentinelRef={sentinelRef}
            // 뒤로가기 버튼이 없어 탭 줄 왼쪽에 자리를 비우지 않는다
            isStuck={false}
          />

          {hasIntro && (
            <div
              id={displayPanelId('intro')}
              role="tabpanel"
              aria-labelledby={displayTabId('intro')}
              hidden={activeTab !== 'intro'}
              className="animate-fade-in"
            >
              <IntroPanel
                display={introDisplay}
                contentPath={
                  previewMode
                    ? (categoryId) =>
                        `/exhibition/${display.displayId}/preview/contents?category=${categoryId}`
                    : undefined
                }
              />
            </div>
          )}
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
                isPreview={previewMode}
                artworkPath={
                  previewMode
                    ? (artworkId) =>
                        `/exhibition/${display.displayId}/artworks/${artworkId}/preview?from=ex`
                    : undefined
                }
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
              {previewMode ? (
                <PreviewReviewsPanel />
              ) : (
                <ReviewsPanel display={display} onPosted={scrollToTabs} />
              )}
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
        <Skeleton className="aspect-402/568 min-[37.5rem]:mx-auto min-[37.5rem]:mt-6 min-[37.5rem]:max-w-120 desktop:mt-0 desktop:max-w-none" />
        <div className={SHEET}>
          {/* DisplaySummary 와 같은 줄: 제목 · 주최, 일정 · 운영 · 장소 */}
          <div className="grid gap-5 px-gutter py-6 desktop:px-0 desktop:pt-0 desktop:pb-5">
            <div>
              <SkeletonText className="typography-title-xs w-2/3" />
              <SkeletonText className="typography-body-lg-regular mt-1 w-1/2" />
            </div>
            <div className="grid gap-2">
              <SkeletonText className="typography-body-lg-regular min-h-5 w-3/5" />
              <SkeletonText className="typography-body-lg-regular min-h-5 w-2/5" />
              <SkeletonText className="typography-body-lg-regular min-h-5 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { type ReactNode, useRef } from 'react';

import {
  DetailBackButton,
  DetailPreviewBanner,
  detailStickyTopClass,
  DetailTabNav,
  DetailTopBar,
  useDetailTab,
} from '@/components/common/detail';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

import { type ArtworkDetailTabKey, artworkPanelId, artworkTabId } from './artworkDetail.utils';
import { ArtworkViewer } from './ArtworkViewer';
import { useDisablePageBounce } from './useDisablePageBounce';
import { useViewerChromeFade } from './useViewerChromeFade';
import { useViewMode } from './useViewMode';

type Props = {
  images: string[];
  title: string;
  onBack: () => void;
  /* 공개 전 전시의 작품. 띠를 두고 900px 이상에서도 뒤로가기를 남긴다 */
  isPreview?: boolean;
  label: ReactNode;
  hasIntro: boolean;
  intro: ReactNode;
  guestbook: ReactNode;
  /* 900px 미만 소개 탭 하단에 고정되는 공유·저장 바 */
  bottomBar: ReactNode;
};

const TABS_WITH_INTRO: ArtworkDetailTabKey[] = ['intro', 'guest'];
const GUEST_ONLY_TABS: ArtworkDetailTabKey[] = ['guest'];
const TAB_LABEL: Record<ArtworkDetailTabKey, string> = { intro: '소개', guest: '방명록' };

/*
 * 프로토타입 반응형(전시 상세와 같은 틀)
 * - 900px 미만: 사진 → 이름표 → 탭. 뒤로가기는 화면을 따라 내려오다 탭 줄이 붙으면 그 왼쪽에 앉는다
 * - 768~899px: 위에 서비스 헤더(64)가 생기고, 탭 줄 · 뒤로가기는 그 아래에 붙는다
 * - 900px 이상: 왼쪽 사진 · 오른쪽 정보 2단, 페이지 하나만 스크롤한다. 뒤로가기는 없다(미리보기만 사진 위에 둔다)
 */
const LAYOUT =
  'mx-auto w-full max-w-list desktop:grid desktop:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] desktop:items-start desktop:gap-x-18 desktop:px-gutter desktop:pt-8 desktop:pb-24';

export function ArtworkDetailShell({
  images,
  title,
  onBack,
  isPreview = false,
  label,
  hasIntro,
  intro,
  guestbook,
  bottomBar,
}: Props) {
  const tabs = hasIntro ? TABS_WITH_INTRO : GUEST_ONLY_TABS;
  const { activeTab, selectTab, sentinelRef, isStuck } = useDetailTab(tabs);
  useDisablePageBounce();

  const [mode, changeMode] = useViewMode(images.length > 1);
  const stageRef = useRef<HTMLDivElement>(null);
  const chrome = useViewerChromeFade(stageRef, mode === 'stack');
  // 탭 줄 왼쪽에 앉아 있을 때는 숨기지 않는다(프로토타입)
  const isBackHidden = chrome.isStackHidden && !isStuck;

  return (
    <div className={cn('min-h-dvh bg-primary-white', detailStickyTopClass(isPreview))}>
      {isPreview && (
        <DetailPreviewBanner message="공개 전 모습이에요. 저장·좋아요·방명록 작성은 할 수 없어요" />
      )}

      <DetailTopBar className={isPreview ? 'top-10' : 'top-0'} />

      {/* 높이 0인 sticky 칸이라 처음엔 사진 위(20, 16)에 있다가, 스크롤하면 화면 맨 위(768px 이상은 헤더 아래)에 붙는다 */}
      <div className="sticky top-[calc(var(--detail-top)-max(16px,env(safe-area-inset-top)))] z-30 h-0 desktop:hidden">
        <DetailBackButton
          onBack={onBack}
          {...chrome.holdProps}
          className={cn(
            'absolute top-[max(16px,env(safe-area-inset-top))] left-5',
            isBackHidden && 'pointer-events-none opacity-0',
          )}
        />
      </div>

      <div className={LAYOUT}>
        <ArtworkViewer
          images={images}
          title={title}
          mode={mode}
          onModeChange={changeMode}
          stageRef={stageRef}
          chrome={chrome}
          isPreview={isPreview}
          onBack={onBack}
        />

        <div className="min-w-0">
          {label}

          <DetailTabNav
            tabs={tabs}
            labels={TAB_LABEL}
            label="작품 상세"
            tabId={artworkTabId}
            panelId={artworkPanelId}
            activeTab={activeTab}
            onTabChange={selectTab}
            sentinelRef={sentinelRef}
            isStuck={isStuck}
          />

          {hasIntro && (
            <div
              id={artworkPanelId('intro')}
              role="tabpanel"
              aria-labelledby={artworkTabId('intro')}
              hidden={activeTab !== 'intro'}
            >
              {intro}
            </div>
          )}
          <div
            id={artworkPanelId('guest')}
            role="tabpanel"
            aria-labelledby={artworkTabId('guest')}
            hidden={activeTab !== 'guest'}
          >
            {guestbook}
          </div>
        </div>
      </div>

      {activeTab === 'intro' && bottomBar}
    </div>
  );
}

export function ArtworkDetailSkeleton() {
  return (
    <div className={cn('min-h-dvh bg-primary-white', detailStickyTopClass(false))}>
      <DetailTopBar className="top-0" />
      <div className={LAYOUT}>
        <Skeleton className="aspect-402/554 min-[600px]:aspect-auto min-[600px]:h-[78vh] desktop:h-[min(78vh,820px)] desktop:rounded-12" />
        <div className="flex flex-col gap-3 px-gutter pt-6 desktop:px-0 desktop:pt-0">
          <Skeleton className="h-7 w-2/3 rounded-4" />
          <Skeleton className="h-6 w-1/3 rounded-4" />
          <Skeleton className="h-5 w-1/2 rounded-4" />
          <Skeleton className="mt-3 h-20 w-full rounded-12" />
        </div>
      </div>
    </div>
  );
}

import { type ReactNode, useRef } from 'react';

import {
  DetailPreviewBanner,
  detailStickyTopClass,
  DetailTabNav,
  DetailTopBar,
  useDetailTab,
} from '@/components/common/detail';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

import { type ArtworkDetailTabKey, artworkPanelId, artworkTabId } from './artworkDetail.utils';
import { ArtworkViewer } from './ArtworkViewer';
import { useDisablePageBounce } from './useDisablePageBounce';
import { useViewerChromeFade } from './useViewerChromeFade';
import { useViewMode } from './useViewMode';

type Props = {
  images: string[];
  /* images 와 같은 순서. 영상인 칸은 영상 주소(images 는 썸네일) */
  videoSrcs?: (string | undefined)[];
  title: string;
  /* 작가 이름들(900px 이상 크게 보기 위 띠) */
  subtitle?: string;
  /* 공개 전 전시의 작품. 위에 미리보기 띠를 둔다 */
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
 * - 900px 미만: 사진 → 이름표 → 탭
 * - 768~899px: 위에 서비스 헤더(64)가 생기고, 탭 줄은 그 아래에 붙는다
 * - 900px 이상(U-157): 왼쪽 사진 열 · 오른쪽 정보가 머리 아래부터 창 끝까지 각자 스크롤한다.
 * 뒤로가기 버튼은 두지 않고 브라우저 뒤로가기에 맡긴다(프로토타입 U-149)
 */
const LAYOUT =
  'mx-auto w-full max-w-310 desktop:grid desktop:h-[calc(100dvh-var(--detail-top))] desktop:grid-cols-[auto_minmax(380px,1fr)] desktop:items-start desktop:gap-x-18 desktop:px-8';
/*
 * 900px 이상 정보 칸: 위 32 · 아래 64 여백으로 따로 스크롤하고, 탭 줄은 칸 맨 위(머리 바로 아래)에 붙는다.
 * 프로토타입은 900px 이상 본문 글자가 16px 이라 탭 · 소개 · 방명록의 14px 글자를 16px 로 올린다(규격 줄 14px 은 그대로)
 */
const INFO_COLUMN =
  'min-w-0 desktop:h-full desktop:overflow-x-hidden desktop:overflow-y-auto desktop:overscroll-contain desktop:pb-16 desktop:[--detail-top:0rem]';
const WIDE_BODY_TEXT =
  'desktop:[&_:is(.typography-body-lg-regular,.typography-body-lg-medium,.typography-body-lg-semibold)]:text-[16px]';
const WIDE_TAB_TEXT = 'desktop:[&_[role=tab]]:text-[16px]';

export function ArtworkDetailShell({
  images,
  videoSrcs,
  title,
  subtitle,
  isPreview = false,
  label,
  hasIntro,
  intro,
  guestbook,
  bottomBar,
}: Props) {
  const tabs = hasIntro ? TABS_WITH_INTRO : GUEST_ONLY_TABS;
  const { activeTab, selectTab, sentinelRef } = useDetailTab(tabs);
  const infoRef = useRef<HTMLDivElement>(null);
  useDisablePageBounce();

  // 900px 이상은 정보 칸이 따로 스크롤하므로, 탭 줄이 붙어 있을 때 바꾸면 그 칸을 탭 줄 위치로 올린다
  const changeTab = (tab: ArtworkDetailTabKey) => {
    selectTab(tab);
    const info = infoRef.current;
    const sentinel = sentinelRef.current;
    if (!info || !sentinel || !window.matchMedia('(min-width: 900px)').matches) return;
    const top =
      sentinel.getBoundingClientRect().top - info.getBoundingClientRect().top + info.scrollTop;
    if (info.scrollTop > top) info.scrollTo({ top, behavior: 'auto' });
  };

  const [mode, changeMode] = useViewMode();
  const stageRef = useRef<HTMLDivElement>(null);
  const chrome = useViewerChromeFade(stageRef, mode === 'stack');

  return (
    <div
      className={cn(
        'min-h-dvh bg-primary-white desktop:h-dvh desktop:overflow-hidden',
        // 끝까지 내렸을 때 아래 여백(프로토타입 900px 미만 body padding-bottom 140). 하단 바는 그 위에 겹친다.
        // 방명록 입력 바는 자기 높이만큼 자리를 비우므로(81) 나머지만 더한다
        activeTab === 'intro' ? 'pb-[calc(140px+env(safe-area-inset-bottom))]' : 'pb-[59px]',
        'desktop:pb-0',
        detailStickyTopClass(isPreview),
      )}
    >
      {isPreview && (
        <DetailPreviewBanner message="공개 전 모습이에요. 저장·좋아요·방명록 작성은 할 수 없어요" />
      )}

      <DetailTopBar className={isPreview ? 'top-10' : 'top-0'} />

      <div className={LAYOUT}>
        <ArtworkViewer
          images={images}
          videoSrcs={videoSrcs}
          title={title}
          subtitle={subtitle}
          mode={mode}
          onModeChange={changeMode}
          stageRef={stageRef}
          chrome={chrome}
        />

        <div ref={infoRef} className={cn(INFO_COLUMN, WIDE_TAB_TEXT)}>
          {/* 위 32 여백은 칸 안쪽 여백 대신 이름표에 둔다. 탭 줄이 칸 맨 위(0)에 붙게 */}
          <div className="desktop:pt-8">{label}</div>

          <DetailTabNav
            tabs={tabs}
            labels={TAB_LABEL}
            label="작품 상세"
            tabId={artworkTabId}
            panelId={artworkPanelId}
            activeTab={activeTab}
            onTabChange={changeTab}
            sentinelRef={sentinelRef}
            isStuck={false}
          />

          {hasIntro && (
            <div
              id={artworkPanelId('intro')}
              role="tabpanel"
              aria-labelledby={artworkTabId('intro')}
              hidden={activeTab !== 'intro'}
              className={WIDE_BODY_TEXT}
            >
              {intro}
            </div>
          )}
          <div
            id={artworkPanelId('guest')}
            role="tabpanel"
            aria-labelledby={artworkTabId('guest')}
            hidden={activeTab !== 'guest'}
            className={WIDE_BODY_TEXT}
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
        <Skeleton className="aspect-402/554 min-[600px]:max-desktop:aspect-auto min-[600px]:max-desktop:h-[78vh] desktop:mt-8 desktop:aspect-3/4 desktop:w-[min(calc((100dvh-var(--detail-top)-108px)*0.75),615px,calc(min(100vw,1240px)-576px))]" />
        {/* ArtworkLabel 과 같은 줄: 제목, 작가(h-8) · 규격, 전시 줄 */}
        <div className="px-gutter pt-6 pb-3 desktop:px-0 desktop:pt-8">
          <SkeletonText className="typography-title-xs desktop:typography-title-md w-2/3" />
          <div className="mt-1 flex flex-col">
            <SkeletonText className="typography-body-xl-semibold h-8 w-1/3" />
            <SkeletonText className="typography-body-lg-medium w-1/2" />
          </div>
          <Skeleton className="mt-3 h-20 w-full rounded-12" />
        </div>
      </div>
    </div>
  );
}

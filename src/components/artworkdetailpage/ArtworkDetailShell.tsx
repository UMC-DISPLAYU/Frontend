import { type ReactNode, useRef } from 'react';

import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

import { artworkPanelId, artworkTabId } from './artworkDetail.utils';
import { ArtworkTabNav } from './ArtworkTabNav';
import { ArtworkViewer } from './ArtworkViewer';
import { useArtworkDetailTab } from './useArtworkDetailTab';
import { useDisablePageBounce } from './useDisablePageBounce';
import { useHasVerticalOverflow } from './useHasVerticalOverflow';

type Props = {
  images: string[];
  title: string;
  onBack: () => void;
  label: ReactNode;
  hasIntro: boolean;
  intro: ReactNode;
  guestbook: ReactNode;
  /* 900px 미만 소개 탭 하단에 고정되는 공유·저장 바 */
  bottomBar: ReactNode;
};

const LAYOUT_CLASS =
  'mx-auto w-full max-w-list desktop:grid desktop:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] desktop:items-start desktop:gap-x-18 desktop:px-gutter desktop:pt-8 desktop:pb-8';

export function ArtworkDetailShell({
  images,
  title,
  onBack,
  label,
  hasIntro,
  intro,
  guestbook,
  bottomBar,
}: Props) {
  const { tabs, activeTab, selectTab, navRef } = useArtworkDetailTab(hasIntro);
  useDisablePageBounce();
  const columnRef = useRef<HTMLDivElement>(null);
  const hasColumnOverflow = useHasVerticalOverflow(columnRef);

  return (
    <div className="min-h-dvh bg-primary-white">
      <div className={LAYOUT_CLASS}>
        <ArtworkViewer images={images} title={title} onBack={onBack} />

        <div
          ref={columnRef}
          className={cn(
            'min-w-0 desktop:sticky desktop:top-8 desktop:-mx-2 desktop:max-h-[calc(100dvh-4rem)] desktop:overflow-y-auto desktop:px-2 desktop:[scrollbar-width:thin]',
            // 내용이 짧을 때도 끄면 이 위에서 휠을 굴려도 왼쪽 사진이 내려가지 않는다
            hasColumnOverflow && 'desktop:overscroll-y-none',
          )}
        >
          {label}

          <ArtworkTabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={selectTab}
            navRef={navRef}
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
    <div className="min-h-dvh bg-primary-white">
      <div className={LAYOUT_CLASS}>
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

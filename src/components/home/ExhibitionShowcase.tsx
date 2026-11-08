import { type KeyboardEvent, type ReactNode, useId } from 'react';

import { Link } from 'react-router-dom';

import ChevronMapIcon from '@/assets/home/ChevronMapIcon.svg';
import MapPinIcon from '@/assets/home/MapPinIcon.svg';
import type { HomeExhibitionCard, HomeExhibitionTab } from '@/hooks/queries/useHome';
import { cn } from '@/utils/cn';

import { ExhibitionListView } from './ExhibitionListView';
import { HOME_INNER } from './homeLayout';
import { HOME_TABS } from './homeTabs';
import { PosterCarousel, PosterCarouselSkeleton } from './PosterCarousel';

export type HomeExhibitionView = 'poster' | 'list';

interface ExhibitionShowcaseProps {
  tab: HomeExhibitionTab;
  onTabChange: (tab: HomeExhibitionTab) => void;
  view: HomeExhibitionView;
  onViewChange: (view: HomeExhibitionView) => void;
  items: HomeExhibitionCard[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ExhibitionShowcase({
  tab,
  onTabChange,
  view,
  onViewChange,
  items,
  isPending,
  isError,
  onRetry,
}: ExhibitionShowcaseProps) {
  const tabId = useId();
  const currentTab = HOME_TABS.find(({ key }) => key === tab) ?? HOME_TABS[0];
  const showRank = tab === 'pop';
  const isList = view === 'list';

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = HOME_TABS[(index + step + HOME_TABS.length) % HOME_TABS.length];
    onTabChange(next.key);
    document.getElementById(`${tabId}-${next.key}`)?.focus();
  };

  let stage: ReactNode;
  // 이미 받은 목록이 있으면 다시 불러오기가 실패해도 목록을 그대로 둔다
  if (isError && !items) {
    stage = (
      <StageMessage message="전시를 불러오지 못했어요">
        <button type="button" onClick={onRetry} className={STAGE_LINK_CLASS}>
          다시 시도
        </button>
      </StageMessage>
    );
  } else if (isPending) {
    stage = <PosterCarouselSkeleton />;
  } else if (!items?.length) {
    stage = (
      <StageMessage message={currentTab.emptyText}>
        <Link to="/search?status=종료" className={STAGE_LINK_CLASS}>
          지난 전시 둘러보기
        </Link>
      </StageMessage>
    );
  } else {
    // 두 보기를 같은 칸에 겹쳐 두고 안 보이는 쪽은 invisible 로만 숨긴다.
    // 둘 중 큰 높이를 유지해 전환해도 아래 화면이 움직이지 않고, 숨긴 쪽은 포커스 · 스크린리더에서 빠진다
    stage = (
      <>
        {/* 프로토타입처럼 포스터(232:329) + 위 여백 16 + 정보 3줄(99)만큼 높이를 잡아 둔다. 장소가 없거나 탭을 바꿔도 높이가 같다 */}
        <div className="grid min-h-[calc(var(--poster-w)*329/232+115px)]">
          <div className={cn('col-start-1 row-start-1 min-w-0', isList && 'invisible')}>
            <PosterCarousel key={tab} items={items} showRank={showRank} />
          </div>
          <div className={cn('col-start-1 row-start-1 min-w-0', !isList && 'invisible')}>
            <ExhibitionListView key={tab} items={items} showRank={showRank} />
          </div>
        </div>
        <div className={cn(HOME_INNER, 'flex justify-end py-1')}>
          <button
            type="button"
            aria-pressed={isList}
            aria-label={isList ? '포스터형으로 보기' : '리스트형으로 보기'}
            onClick={() => onViewChange(isList ? 'poster' : 'list')}
            className="typography-body-md-medium -my-2.5 flex min-h-11 items-center gap-0.75 rounded-4 text-tertiary underline underline-offset-2 transition-colors duration-fast ease-standard hover:text-quaternary focus-visible:outline-2 focus-visible:outline-focus-inverse"
          >
            {isList ? <PosterViewIcon /> : <ListViewIcon />}
            {isList ? '포스터형' : '리스트형'}
          </button>
        </div>
      </>
    );
  }

  return (
    <section
      aria-label="전시 둘러보기"
      className="bg-primary-black pb-6.5 text-quaternary [--poster-w:232px] tablet:[--poster-w:264px] min-[68.75rem]:[--poster-w:320px]"
    >
      <div
        role="tablist"
        aria-label="전시 분류"
        className="mx-auto flex max-w-[calc(1320px+var(--home-pad)*2)] justify-center-safe overflow-x-auto px-[calc(var(--home-pad)-12px)] pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {HOME_TABS.map(({ key, label }, index) => {
          const isSelected = key === tab;
          return (
            <button
              key={key}
              id={`${tabId}-${key}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${tabId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onTabChange(key)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                'typography-body-lg-semibold flex-none border-b-2 px-3 py-2 transition-colors duration-fast ease-standard hover:text-quaternary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-inverse',
                isSelected
                  ? 'border-interactive-inverse text-quaternary'
                  : 'border-transparent text-tertiary',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${tab}`}>
        {stage}
      </div>

      <Link
        to="/map"
        className="group mt-4 block border-t border-icon-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-inverse"
      >
        <span className={cn(HOME_INNER, 'flex items-center justify-between py-5')}>
          <span className="flex items-center gap-3.5">
            <span className="grid size-8.5 place-items-center">
              <img src={MapPinIcon} alt="" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="typography-body-xl-semibold">가까운 전시 찾기</span>
              <span className="typography-body-md-medium text-tertiary">
                지도에서 전시 위치를 확인해보세요
              </span>
            </span>
          </span>
          <span className="grid size-8 place-items-center transition-transform duration-base ease-standard group-hover:translate-x-0.5">
            <img src={ChevronMapIcon} alt="" />
          </span>
        </span>
      </Link>
    </section>
  );
}

const STAGE_LINK_CLASS =
  'typography-body-md-medium flex min-h-11 items-center rounded-4 text-tertiary underline underline-offset-2 transition-colors duration-fast ease-standard hover:text-quaternary focus-visible:outline-2 focus-visible:outline-focus-inverse';

function StageMessage({ message, children }: { message: string; children: ReactNode }) {
  return (
    <div className="grid min-h-70 place-content-center justify-items-center text-center">
      <p className="typography-body-xl-semibold">{message}</p>
      {children}
    </div>
  );
}

// 프로토타입 인라인 아이콘. currentColor 라 버튼 hover 색을 따라간다
function ListViewIcon() {
  return (
    <svg
      viewBox="0 0 15 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-3.5 w-3.75 shrink-0"
    >
      <path d="M5 3h8M5 7h8M5 11h8M1.5 3h.01M1.5 7h.01M1.5 11h.01" />
    </svg>
  );
}

function PosterViewIcon() {
  return (
    <svg
      viewBox="0 0 15 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.75 shrink-0"
    >
      <path d="M2.5 6A5 5 0 0 1 11.6 4M12.5 8A5 5 0 0 1 3.4 10" />
      <path d="M11.8 1.6V4.2H9.2M3.2 12.4V9.8h2.6" />
    </svg>
  );
}

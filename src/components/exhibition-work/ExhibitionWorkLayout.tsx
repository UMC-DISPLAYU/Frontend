import { type ReactNode, useId } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import BackIcon from '@/assets/exhibition-work/BackIcon.svg';
import { DisplayPublishStatusLabel } from '@/components/common/DisplayPublishStatusLabel';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { PageContainer } from '@/components/layout';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { cn } from '@/utils/cn';
import { isDisplayPublishStatus } from '@/utils/displayPublishStatus';
import { getDisplayStatusLabel } from '@/utils/mypage';

import { WorkIcon } from './WorkIcon';

export type WorkTab = 'artworks' | 'contents';

export function WorkHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const flowBack = useFlowBack();

  return (
    <header className="flex min-h-19 items-center gap-0.5 py-4">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack ?? flowBack}
        className="group -ml-2.5 flex size-11 shrink-0 items-center justify-center rounded-12 transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
      >
        <img
          src={BackIcon}
          alt=""
          className="transition-transform duration-fast ease-standard group-hover:-translate-x-0.5"
        />
      </button>
      <h1 className="typography-title-xs text-primary">{title}</h1>
    </header>
  );
}

/* 프로토타입 `.bar`: 높이 56 · 뒤로가기 44(아이콘 x20) · 제목 20 Bold, 넓은 화면(.wide)은 900px 이상 24 */
export function WorkBar({
  title,
  onBack,
  backLabel = '뒤로가기',
  wide = false,
}: {
  title: string;
  onBack: () => void;
  backLabel?: string;
  wide?: boolean;
}) {
  return (
    <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label={backLabel}
        onClick={onBack}
        className="grid size-11 place-items-center rounded-circle transition-colors duration-fast hover:bg-[#f4f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
      >
        <WorkIcon name="back" />
      </button>
      <h1 className={cn('text-[20px] font-bold', wide && 'desktop:text-[24px]')}>{title}</h1>
    </header>
  );
}

/* 프로토타입 일정 표기: 앞에 연도, 끝 연도는 다를 때만 (2026.06.10–06.20) */
const formatPeriod = ({ startDate, endDate }: DisplayDetailDto['period']) => {
  const dot = (date: string) => date.replace(/-/g, '.');
  if (!endDate || startDate === endDate) return dot(startDate);
  const end = endDate.slice(0, 4) === startDate.slice(0, 4) ? dot(endDate).slice(5) : dot(endDate);
  return `${dot(startDate)}–${end}`;
};

/*
 * 프로토타입 works.html 의 `.page.wide` 틀: 600px 미만 480, 768px 이상 672, 900px 이상 1160.
 * 넓은 화면에서도 양옆은 흰색이다(프로토타입 body #fff)
 */
export function ExhibitionWorkLayout({
  display,
  activeTab,
  onTabChange,
  onBack,
  children,
}: {
  display: DisplayDetailDto;
  activeTab: WorkTab;
  onTabChange?: (tab: WorkTab) => void;
  onBack?: () => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { data: userMe } = useUserMe();
  const tabId = useId();
  /*
   * 프로토타입 works.html: 뒤로가기는 기록을 되돌리지 않고 정해진 곳으로 간다.
   * 대표자는 전시 관리, 관리자 · 팀원은 내 전시 관리. 대표자를 위임하고 이 화면에 온 경우에도
   * 이미 들어갈 수 없는 화면(팀원 관리)으로 돌아가지 않는다
   */
  const isOwner = userMe !== undefined && display.ownerUserId === userMe.id;
  const backToList = () =>
    navigate(isOwner ? `/exhibition/${display.displayId}/manage` : '/display-management');
  const changeTab = (tab: WorkTab) => {
    if (onTabChange) onTabChange(tab);
    else navigate(`/exhibition/${display.displayId}/work?tab=${tab}`, { replace: true });
  };

  return (
    // 프로토타입은 모든 요소에 자간 -0.03em 을 준다(글자 크기마다 따로 계산되게 자식마다 둔다)
    <div className="min-h-dvh bg-[#fff] text-[14px] leading-[1.4] font-medium text-[#18181b] [&_*]:tracking-[-0.03em]">
      <PageContainer
        variant="list"
        fillHeight
        className="max-w-120 pt-[max(8px,env(safe-area-inset-top))] tablet:max-w-168 tablet:pt-10 desktop:max-w-list"
      >
        <WorkBar
          title="전시 작업"
          onBack={onBack ?? backToList}
          backLabel={isOwner ? '전시 관리로 돌아가기' : '내 전시 관리로 돌아가기'}
          wide
        />

        {/* 900px 이상은 2단(프로토타입 11-15 `.body.split`): 왼쪽 전시 요약 380 · 사이 56 · 오른쪽 탭 · 목록 */}
        <div className="flex-1 desktop:grid desktop:grid-cols-[380px_minmax(0,1fr)] desktop:items-start desktop:gap-x-14">
          <div className="mt-2 grid animate-rise grid-cols-[82px_minmax(0,1fr)] gap-x-3.5 rounded-12 border border-[#d4d4d8] p-3">
            <div className="aspect-402/568 w-[82px] bg-[#f4f4f5]">
              <OptimizedImage
                src={display.images[0]?.imageUrl}
                alt={`${display.title} 포스터`}
                displayWidth={82}
                skeleton
                loading="eager"
                frameClassName="h-full w-full"
                className="object-cover"
              />
            </div>
            <div className="grid min-w-0 content-start gap-0.5">
              <div className="flex items-center justify-between gap-2">
                {isDisplayPublishStatus(display.status) ? (
                  <DisplayPublishStatusLabel status={display.status} />
                ) : (
                  // 모르는 값(목 데이터의 전시 기간 상태 등)은 기존처럼 한글 라벨을 준비 중 모양으로 보인다
                  <DisplayPublishStatusLabel
                    status="DRAFT"
                    label={getDisplayStatusLabel(display.status)}
                  />
                )}
                <Link
                  to={`/display/${display.displayId}`}
                  className="group inline-flex items-center text-[12px] font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]"
                >
                  전시 미리보기
                  <WorkIcon
                    name="chev"
                    className="size-5 p-[3px] transition-transform duration-base ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
              <h2 className="mt-1 truncate text-[16px] font-semibold">{display.title}</h2>
              <p className="truncate text-[12px] font-medium text-[#3f3f47]">
                {[display.organization, display.department].filter(Boolean).join(' ')}
              </p>
              <p className="truncate text-[12px] font-medium tracking-[0.01em]! text-[#3f3f47]">
                {formatPeriod(display.period)}
              </p>
              <p className="truncate text-[12px] font-medium text-[#3f3f47]">
                {display.location.placeName}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div
              role="tablist"
              aria-label="전시 작업"
              // 탭 줄은 프로토타입이 아니라 사용자 지시로 예전 모양(열 폭 전체 · 높이 48 · 밑줄 2)을 쓴다.
              // 900px 이상은 요약 카드 윗선(8)과 나란히
              className="mt-4 flex border-b border-primary desktop:mt-2"
            >
              {(['artworks', 'contents'] as const).map((tab) => (
                <button
                  key={tab}
                  id={`${tabId}-${tab}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`${tabId}-panel`}
                  tabIndex={activeTab === tab ? 0 : -1}
                  onClick={() => changeTab(tab)}
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const next =
                      event.key === 'Home'
                        ? 'artworks'
                        : event.key === 'End'
                          ? 'contents'
                          : tab === 'artworks'
                            ? 'contents'
                            : 'artworks';
                    changeTab(next);
                    document.getElementById(`${tabId}-${next}`)?.focus();
                  }}
                  className={cn(
                    'typography-body-lg-medium -mb-px h-12 flex-1 border-b-2 transition-colors duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                    activeTab === tab
                      ? 'typography-body-lg-semibold border-interactive-selected text-primary'
                      : 'border-transparent text-secondary',
                  )}
                >
                  {tab === 'artworks' ? '전시작' : '전시 콘텐츠'}
                </button>
              ))}
            </div>
            <section
              id={`${tabId}-panel`}
              role="tabpanel"
              aria-labelledby={`${tabId}-${activeTab}`}
            >
              {children}
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

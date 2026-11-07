import { type ReactNode, useId } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import BackIcon from '@/assets/exhibition-work/BackIcon.svg';
import CalendarIcon from '@/assets/exhibition-work/CalendarIcon.svg';
import ChevronIcon from '@/assets/exhibition-work/ChevronIcon.svg';
import LocationIcon from '@/assets/exhibition-work/LocationIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { PageContainer } from '@/components/layout';
import { useFlowBack } from '@/hooks/useFlowBack';
import { cn } from '@/utils/cn';
import { getDisplayStatusLabel } from '@/utils/mypage';

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
  const tabId = useId();
  const changeTab = (tab: WorkTab) => {
    if (onTabChange) onTabChange(tab);
    else navigate(`/exhibition/${display.displayId}/work?tab=${tab}`, { replace: true });
  };
  const status = display.status === 'DRAFT' ? '준비 중' : getDisplayStatusLabel(display.status);
  const period = `${display.period.startDate.slice(5).replace('-', '.')}–${display.period.endDate.slice(5).replace('-', '.')}`;

  return (
    <PageContainer variant="list" fillHeight className="bg-primary-white pb-10 text-primary">
      <WorkHeader title="전시 작업" onBack={onBack} />
      <div className="mb-4 flex items-center gap-3 rounded-12 border border-primary p-3">
        <div className="h-26.25 w-21 shrink-0 overflow-hidden rounded-12 bg-secondary">
          <OptimizedImage
            src={display.images[0]?.imageUrl}
            alt={`${display.title} 포스터`}
            displayWidth={84}
            skeleton
            loading="eager"
            frameClassName="h-full w-full rounded-12"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-h-5 items-center justify-between gap-1">
            <p className="typography-body-md-semibold flex shrink-0 items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-circle bg-interactive-primary" />
              {status}
            </p>
            <Link
              to={`/display/${display.displayId}`}
              className="typography-body-md-semibold group -my-3 -mr-1 flex min-h-11 items-center gap-2 rounded-8 px-1 transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-99"
            >
              전시 미리보기
              <img
                src={ChevronIcon}
                alt=""
                className="transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <p className="typography-body-lg-semibold truncate">{display.title}</p>
          <p className="typography-body-md-medium truncate text-secondary">
            {[display.organization, display.department].filter(Boolean).join(' ')}
          </p>
          <p className="typography-body-md-medium flex items-center gap-1 text-secondary">
            <img src={CalendarIcon} alt="" />
            {period}
          </p>
          <p className="typography-body-md-medium flex min-w-0 items-center gap-1 text-secondary">
            <img src={LocationIcon} alt="" />
            <span className="truncate">{display.location.placeName}</span>
          </p>
        </div>
      </div>
      <div role="tablist" aria-label="전시 작업" className="mb-1 flex border-b border-primary">
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
      <section id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${activeTab}`}>
        {children}
      </section>
    </PageContainer>
  );
}

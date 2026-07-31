import { useEffect, useState } from 'react';

import { Calendar, Clock, Heart, MapPin } from 'lucide-react';

import type { DisplayDetailDto } from '@/api/dto/display.dto';
import { cn } from '@/utils/cn';

import { DisplaySaveButton } from './DisplaySaveButton';

type Props = {
  display: DisplayDetailDto;
};

function formatDate(start: string, end: string) {
  if (!start || !end) return '';
  const [sYear, sMonth, sDay] = start.split('-');
  const [eYear, eMonth, eDay] = end.split('-');
  const startFmt = `${sYear}.${sMonth}.${sDay}`;
  const endFmt = sYear === eYear ? `${eMonth}.${eDay}` : `${eYear}.${eMonth}.${eDay}`;
  return `${startFmt} - ${endFmt}`;
}

function formatTime(start: string, end: string) {
  if (!start || !end) return '';
  const trim = (t: string) => t.slice(0, 5);
  return `${trim(start)} - ${trim(end)}`;
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-2 typo-body-sm-regular text-main">
      <Icon size={13} className="text-faint shrink-0" />
      <span className="text-faint font-medium w-6 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function ExhibitionMeta({ display: ex }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fullSubtitle = [ex.organization, ex.subtitle].filter(Boolean).join(' ');
  const displayedLikeCount = (ex.likeCount ?? 0) + (bookmarked ? 1 : 0);

  return (
    <section className="px-5 pt-6 pb-4 bg-[#f0f0f3]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 flex flex-col gap-1.5">
          <h1 className="typo-body-xl-bold text-main">{ex.title}</h1>
          {fullSubtitle && <p className="typo-body-sm-regular text-sub600">{fullSubtitle}</p>}
        </div>
        <button
          type="button"
          id="meta-heart-btn"
          onClick={() => setBookmarked((v) => !v)}
          className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Heart
            size={17}
            className={cn(
              'transition-colors duration-200',
              bookmarked ? 'fill-heart text-heart' : 'fill-none text-sub700',
            )}
          />
          <span className={cn('typo-body-xs-regular', bookmarked ? 'text-heart' : 'text-sub700')}>
            {displayedLikeCount}
          </span>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <MetaRow
          icon={Calendar}
          label="일정"
          value={formatDate(ex.period?.startDate, ex.period?.endDate)}
        />
        <MetaRow
          icon={Clock}
          label="운영"
          value={formatTime(ex.period?.startTime, ex.period?.endTime)}
        />
        <MetaRow icon={MapPin} label="장소" value={ex.location?.placeName} />
      </div>

      {!isAtTop && (
        <div className="px-1 pt-10">
          <DisplaySaveButton />
        </div>
      )}
    </section>
  );
}

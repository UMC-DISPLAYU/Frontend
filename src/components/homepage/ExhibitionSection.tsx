import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { HomeExhibitionDto } from '@/api/dto';
import { SectionHeader } from '@/components/homepage/SectionHeader';
import {
  useArchivedExhibitions,
  useArchiveExhibition,
  useUnarchiveExhibition,
} from '@/hooks/queries/useArchive';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

const formatMonthDay = (date: string) => {
  if (!date) return '';
  const [, month, day] = date.split('-');
  return `${month}.${day}`;
};

function ExhibitionCard({
  item,
  savedExhibitionIds,
  onBookmarkClick,
}: {
  item: HomeExhibitionDto;
  savedExhibitionIds: Set<number>;
  onBookmarkClick: (displayId: number, saved: boolean, e: React.MouseEvent) => void;
}) {
  const navigate = useNavigate();
  const orgDept = [item.organization, item.department].filter(Boolean).join(' ');
  const isSaved = item.isArchived === true || savedExhibitionIds.has(item.displayId);

  return (
    <article
      className="flex flex-col gap-1.5 min-w-0 bg-page cursor-pointer"
      onClick={() => navigate(`/display/${item.displayId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/display/${item.displayId}`);
        }
      }}
    >
      <div className="w-full aspect-3/4 rounded-xl shrink-0 overflow-hidden bg-box200 relative">
        {item.posterImageUrl ? (
          <img src={item.posterImageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : null}
        <button
          type="button"
          aria-label={isSaved ? '북마크 취소' : '북마크'}
          aria-pressed={isSaved}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => onBookmarkClick(item.displayId, isSaved, e)}
          className="absolute inset-e-0 bottom-0 px-2.5 pb-2 flex items-end justify-end cursor-pointer"
        >
          <Bookmark
            className={cn(
              'size-4.5 drop-shadow-sm transition-colors',
              isSaved ? 'text-bookmark' : 'text-white',
            )}
            strokeWidth={1.8}
            fill={isSaved ? 'currentColor' : 'transparent'}
            stroke="currentColor"
          />
        </button>
      </div>
      <div className="flex flex-col">
        <p className="typo-body-xs-bold text-main truncate">{item.title}</p>
        {orgDept ? (
          <p className="typo-body-xs-regular text-sub700 truncate -mt-0.5">{orgDept}</p>
        ) : null}
        <p className="typo-body-xs-regular text-hint mt-0.5">
          {formatMonthDay(item.startedAt)} - {formatMonthDay(item.endedAt)}
        </p>
      </div>
    </article>
  );
}

type Props = {
  title: string;
  items: HomeExhibitionDto[];
  linkTo?: string;
};

export function ExhibitionSection({ title, items, linkTo }: Props) {
  const archive = useArchiveExhibition();
  const unarchive = useUnarchiveExhibition();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const { data: archivedData } = useArchivedExhibitions();

  const savedExhibitionIds = new Set(archivedData?.savedExhibitions?.map((s) => s.displayId) ?? []);

  const handleBookmarkClick = (displayId: number, saved: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayId <= 0) return;

    if (!hasPermission(archivePolicy, saved ? 'delete' : 'create')) {
      openLoginModal();
      return;
    }

    const mutation = saved ? unarchive : archive;
    mutation.mutate(displayId);
  };

  return (
    <section className="mb-7">
      {loginModal}
      <SectionHeader title={title} linkTo={linkTo} />
      <div className="grid grid-cols-3 gap-2 px-4">
        {items.map((item) => (
          <ExhibitionCard
            key={item.displayId}
            item={item}
            savedExhibitionIds={savedExhibitionIds}
            onBookmarkClick={handleBookmarkClick}
          />
        ))}
      </div>
    </section>
  );
}

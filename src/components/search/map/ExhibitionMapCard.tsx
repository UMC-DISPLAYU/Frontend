import { Bookmark } from 'lucide-react';

import {
  useArchivedExhibitions,
  useArchiveExhibition,
  useUnarchiveExhibition,
} from '@/hooks/queries/useArchive';
import type { NearbyDisplay } from '@/hooks/useNearbyDisplays';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useArchivePolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

interface ExhibitionMapCardProps {
  exhibition: NearbyDisplay;
  selected?: boolean;
  onClick?: () => void;
  onToggleBookmark?: () => void;
}

export function ExhibitionMapCard({
  exhibition,
  onClick,
  onToggleBookmark,
}: ExhibitionMapCardProps) {
  const archive = useArchiveExhibition();
  const unarchive = useUnarchiveExhibition();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const archivePolicy = useArchivePolicy();
  const { data: archivedData } = useArchivedExhibitions();

  const isPending = archive.isPending || unarchive.isPending;

  const savedExhibitionIds = new Set(archivedData?.savedExhibitions?.map((s) => s.displayId) ?? []);
  const isSaved = exhibition.isArchived || savedExhibitionIds.has(exhibition.displayId);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending || exhibition.displayId <= 0) return;

    if (!hasPermission(archivePolicy, isSaved ? 'delete' : 'create')) {
      openLoginModal();
      return;
    }

    const mutation = isSaved ? unarchive : archive;
    mutation.mutate(exhibition.displayId);
    onToggleBookmark?.();
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 북마크 버튼 클릭은 무시
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  const schoolDeptText = exhibition.schoolDepartmentName;

  return (
    <>
      <div
        onClick={handleCardClick}
        className="h-40 w-full rounded-2xl bg-box100 px-4 py-3.5 no-underline transition-all cursor-pointer shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_2px_2px_3px_0px_rgba(0,0,0,0.20),inset_-2px_-2px_3px_0px_rgba(255,255,255,1.00)]"
      >
        <div className="flex items-start gap-2.5 self-stretch">
          <div className="flex flex-1 items-start gap-3 min-w-0 h-32">
            {/* 포스터 이미지 */}
            <div className="relative h-33 w-24 shrink-0 overflow-hidden rounded-xl bg-box200 shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]">
              <img
                src={exhibition.posterImageUrl}
                alt={exhibition.title}
                className="size-full object-cover"
              />
            </div>

            {/* 우측 정보 영역 */}
            <div className="flex flex-1 flex-col justify-start items-start gap-4 min-w-0">
              {/* 전시 태그: 디자인 토큰 bg-tag-bg, text-tag-fg */}
              <div className="inline-flex items-start justify-start rounded-sm bg-tag-bg px-2 py-0.5">
                <span className="text-tag-fg typo-body-xxs-regular">{exhibition.status}</span>
              </div>

              <div className="flex flex-col items-start justify-start gap-2.5 self-stretch min-w-0">
                {/* 1. 전시 타이틀 */}
                <div className="self-stretch truncate typo-body-md-bold text-main">
                  {exhibition.title}
                </div>

                <div className="flex flex-col items-start justify-start gap-4 self-stretch min-w-0">
                  <div className="flex flex-col items-start justify-start self-stretch min-w-0">
                    {/* 2. schoolDepartmentName */}
                    <div className="self-stretch truncate typo-body-xs-regular text-sub700">
                      {schoolDeptText || '\u00A0'}
                    </div>
                    {/* 3. 스타트 엔드 시간 */}
                    <div className="self-stretch typo-body-xs-regular text-hint">
                      {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                    </div>
                  </div>

                  {/* 4. locationName */}
                  <div className="inline-flex h-4 items-center justify-start gap-2 self-stretch">
                    <div className="flex h-4 items-end justify-start gap-2 w-full min-w-0">
                      <div className="truncate typo-body-xxs-regular text-faint w-full">
                        {exhibition.locationName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 북마크 아이콘 */}
          <button
            type="button"
            aria-label={isSaved ? '북마크 취소' : '북마크'}
            aria-pressed={isSaved}
            disabled={isPending}
            onClick={handleBookmarkClick}
            className="size-4 shrink-0 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <Bookmark
              className={cn(
                'size-4 transition-colors',
                isSaved ? 'text-bookmark' : 'text-stone-400',
              )}
              strokeWidth={1.5}
              fill={isSaved ? 'currentColor' : 'transparent'}
              stroke="currentColor"
              aria-hidden
            />
          </button>
        </div>
      </div>
      {loginModal}
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';

import { Bookmark, ChevronRight, ChevronUp } from 'lucide-react';

import type { ArtworkCoAuthorDto } from '@/api/dto';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import {
  useArchiveArtist,
  useArchivedArtists,
  useUnarchiveArtist,
} from '@/hooks/queries/useArchive';
import { useUserArtistProfile } from '@/hooks/queries/useUserProfile';
import { useAuthStore } from '@/stores/authStore';
import type { ArtworkDetail } from '@/types/exhibition';
import { cn } from '@/utils/cn';

type Props = {
  artwork: ArtworkDetail;
  /* 대표 작가 저장에 필요한 계정 id. 직접 입력된 작가는 없을 수 있습니다. */
  artistUserId?: number;
  /* 공동 작업자 목록. 계정이 연결되지 않은 공동 작업자는 userId가 null입니다. */
  coAuthors?: ArtworkCoAuthorDto[];
};

type ArtworkArtistRowProps = {
  userId?: number;
  /* 작품에 기록된 이름. 공동 작업자는 이 이름이 따로 없어 프로필명으로만 표시됩니다. */
  displayName: string;
};

function ArtworkArtistRow({ userId, displayName }: ArtworkArtistRowProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  /* 작가 닉네임과 프로필 이미지는 작가 프로필 조회로 채웁니다. */
  const { data: profile } = useUserArtistProfile(userId ?? 0);
  /* 저장 여부는 내가 저장한 작가 목록과 대조합니다. 페이지가 남아있으면 계속 불러와 전체 목록을 확보합니다. */
  const {
    data: archivedArtists,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useArchivedArtists();

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const archiveArtist = useArchiveArtist();
  const unarchiveArtist = useUnarchiveArtist();
  const isPending = archiveArtist.isPending || unarchiveArtist.isPending;

  const isSaved = (archivedArtists?.pages.flatMap((page) => page.artists) ?? []).some(
    (artist) => artist.artistUserId === userId,
  );

  /* 공동 작업자는 작품에 기록된 이름이 없어, 있으면 프로필명을 대표 이름으로 씁니다. */
  const primaryName = displayName || profile?.artistName || '이름 미상';
  const nicknameText = displayName ? (profile?.artistName ?? '') : '';

  /* 북마크를 누르면 내가 저장한 작가 목록에 추가/제거합니다. */
  const toggleArtistBookmark = () => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!userId || isPending) return;

    if (isSaved) unarchiveArtist.mutate(userId);
    else archiveArtist.mutate(userId);
  };

  return (
    <div className="flex h-[84px] w-full items-center justify-between px-5">
      <LoginConfirmModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="flex min-w-0 items-center gap-2">
        <img
          src={profile?.profileImageUrl || FALLBACK_PROFILE_IMAGE}
          alt={primaryName}
          className="size-[39px] shrink-0 rounded-full object-cover"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
          }}
        />
        <div className="flex min-w-0 flex-col items-start justify-center gap-0.5">
          <p className="w-full truncate typo-body-md-bold text-main">{primaryName}</p>
          <p className="w-full truncate typo-body-xs-regular text-faint">{nicknameText}</p>
        </div>
      </div>

      {userId ? (
        <button
          type="button"
          aria-label={`${primaryName} 작가 저장`}
          aria-pressed={isSaved}
          onClick={toggleArtistBookmark}
          disabled={isPending}
          className="flex h-11 w-5 shrink-0 items-center justify-center cursor-pointer disabled:opacity-60"
        >
          <Bookmark
            className={cn(
              'size-5 transition-colors',
              isSaved ? 'fill-line text-line' : 'text-faint',
            )}
            strokeWidth={1}
          />
        </button>
      ) : null}
    </div>
  );
}

export function ArtworkIntroTab({ artwork, artistUserId, coAuthors = [] }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  /* 대표 작가 + 공동 작업자를 한 줄씩 보여줍니다. */
  const artistRows: ArtworkArtistRowProps[] = [
    { userId: artistUserId, displayName: artwork.artist || '작가 미상' },
    ...coAuthors
      .filter((coAuthor) => coAuthor.userId !== artistUserId)
      .map((coAuthor) => ({ userId: coAuthor.userId ?? undefined, displayName: coAuthor.name })),
  ];

  const processImages = useMemo(
    () =>
      artwork.images
        .filter((img) => img.imageType === 'WORK_PROCESS')
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [artwork.images],
  );

  return (
    <div className="pb-28">
      {/* 작품소개 */}
      <section className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="typo-body-xl-bold text-main">작품소개</h2>
        </div>
        <p
          className={cn(
            'typo-body-sm-regular text-main leading-relaxed',
            !isExpanded && 'line-clamp-3',
          )}
        >
          {artwork.content}
        </p>
        <div className="flex items-center justify-end pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-0.5 typo-body-xs-regular text-faint cursor-pointer"
          >
            <span>{isExpanded ? '접기' : '더보기'}</span>
            {isExpanded ? (
              <ChevronUp size={14} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </section>

      {/* 작업과정 */}
      {processImages.length > 0 && (
        <section className="flex flex-col items-start gap-2.5 self-stretch bg-[#E9E9E9] py-5 mix-blend-multiply">
          <div className="flex flex-col items-center gap-3 self-stretch px-5">
            <div className="flex w-[362px] items-end justify-between self-start">
              <h2 className="typo-body-xl-bold text-main">작업과정</h2>
            </div>
            <div
              className="-mx-5 flex min-w-0 self-stretch gap-2 overflow-x-auto px-[15px]"
              style={{ scrollbarWidth: 'none' }}
            >
              {processImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.imageUrl}
                  alt={`작업과정 ${idx + 1}`}
                  className="h-[152px] w-[119px] shrink-0 rounded-[13px] bg-[rgba(161,156,156,0.5)] object-cover shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 감상 포인트 */}
      <section className="px-5 pt-5 pb-5">
        <h2 className="typo-body-xl-bold text-main mb-3">감상 포인트</h2>
        <p className="typo-body-sm-regular text-main leading-relaxed">{artwork.point}</p>
      </section>

      {/* 작가 정보 */}
      <section className="flex flex-col">
        {artistRows.map((row, index) => (
          <ArtworkArtistRow
            key={row.userId ?? index}
            userId={row.userId}
            displayName={row.displayName}
          />
        ))}
      </section>
    </div>
  );
}

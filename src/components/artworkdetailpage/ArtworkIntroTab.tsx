import { useState } from 'react';

import { Bookmark, ChevronRight, ChevronUp } from 'lucide-react';

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

type Props = {
  artwork: ArtworkDetail;
  /* 작가 저장에 필요한 계정 id. 직접 입력된 작가는 없을 수 있습니다. */
  artistUserId?: number;
};

export function ArtworkIntroTab({ artwork, artistUserId }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  /* 작가 닉네임과 프로필 이미지는 작가 프로필 조회로 채웁니다. */
  const { data: artistProfile } = useUserArtistProfile(artistUserId ?? 0);
  /* 저장 여부는 내가 저장한 작가 목록과 대조합니다. */
  const { data: archivedArtists } = useArchivedArtists();

  const archiveArtist = useArchiveArtist();
  const unarchiveArtist = useUnarchiveArtist();
  const isPending = archiveArtist.isPending || unarchiveArtist.isPending;

  const isSaved = (archivedArtists?.savedArtists ?? []).some(
    (artist) => artist.artistId === artistUserId,
  );

  const artistList = artwork.artist
    ? artwork.artist
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
    : [];

  /* 북마크를 누르면 내가 저장한 작가 목록에 추가/제거합니다. */
  const toggleArtistBookmark = () => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!artistUserId || isPending) return;

    if (isSaved) unarchiveArtist.mutate(artistUserId);
    else archiveArtist.mutate(artistUserId);
  };

  return (
    <div className="pb-bottom-bar-offset">
      <LoginConfirmModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      {/* 작품소개 */}
      <section className="px-5 pt-7 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="typo-body-xl-bold text-main">작품소개</h2>
        </div>
        <p
          className={`typo-body-sm-regular text-main leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}
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
      <section className="px-5 pt-5 pb-5 bg-box200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="typo-body-xl-bold text-main">작업과정</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {artwork.images
            .filter((img) => !img.isThumbnail)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img, idx) => (
              <img
                key={idx}
                src={img.imageUrl}
                alt={`작업과정 ${idx + 1}`}
                className="w-full h-40 object-cover rounded-2xl"
              />
            ))}
        </div>
      </section>

      {/* 감상 포인트 */}
      <section className="px-5 pt-5 pb-5">
        <h2 className="typo-body-xl-bold text-main mb-3">감상 포인트</h2>
        <p className="typo-body-sm-regular text-main leading-relaxed">{artwork.point}</p>
      </section>

      {/* 작가 정보 */}
      <section className="pt-2 pb-4 flex flex-col">
        {artistList.map((artistName, index) => {
          /* 작품 응답은 대표 작가 한 명의 프로필만 담고 있습니다. */
          const profile = index === 0 ? artistProfile : undefined;

          return (
            <div
              key={artistName}
              className="w-full h-20 px-5 py-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={profile?.profileImageUrl || FALLBACK_PROFILE_IMAGE}
                  alt={artistName}
                  className="size-10 rounded-full object-cover shrink-0"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
                  }}
                />
                <div className="flex flex-col justify-center items-start gap-0.5 min-w-0 flex-1">
                  <p className="w-full typo-body-md-bold text-main truncate">
                    {profile?.artistName || artistName}
                  </p>
                  <p className="w-full typo-body-xs-regular text-faint truncate">
                    {profile?.schoolName ?? ''}
                  </p>
                </div>
              </div>

              {index === 0 && artistUserId ? (
                <button
                  type="button"
                  aria-label={`${artistName} 작가 저장`}
                  aria-pressed={isSaved}
                  onClick={toggleArtistBookmark}
                  disabled={isPending}
                  className="w-5 h-11 flex justify-center items-center shrink-0 cursor-pointer disabled:opacity-60"
                >
                  <Bookmark
                    className={`size-5 transition-colors ${
                      isSaved ? 'fill-line text-line' : ' text-faint'
                    }`}
                    strokeWidth={1}
                  />
                </button>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

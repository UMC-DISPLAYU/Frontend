import { useParams } from 'react-router-dom';

import {
  ArtistExhibitionRow,
  ArtistExhibitionRowSkeleton,
  ArtistProfileHeader,
  ArtistProfileHeaderSkeleton,
  ArtistProfileSection,
  ArtistWorkCard,
  ArtistWorkCardSkeleton,
  BackIcon,
  useArtistProfile,
} from '@/components/artist-profile';
import { ErrorView } from '@/components/common';
import { DetailTopBar } from '@/components/common/detail';
import { SkeletonList } from '@/components/ui';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';

const EXHIBITION_LIMIT = 3;
const WORK_LIMIT = 6;
const EXHIBITION_LIST_CLASS = 'mt-3 divide-y divide-bg-tertiary';
const WORK_GRID_CLASS =
  'mt-3 grid grid-cols-2 gap-x-4 gap-y-5 px-1 desktop:grid-cols-3 desktop:gap-x-5 desktop:gap-y-7 desktop:px-0';

/** 작가 프로필(/artist/:userId). 본인이 보면 저장 대신 프로필 수정 버튼을 둔다 */
export function AuthPage() {
  const flowBack = useFlowBack();
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);

  const accessToken = useAuthStore((state) => state.accessToken);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const artist = useArtistProfile(userId);
  const { header, profileQuery } = artist;

  const handleToggleSave = () => {
    if (!accessToken) {
      openLoginModal();
      return;
    }
    if (artist.isSavePending) return;

    const mutation = artist.isSaved ? artist.unarchiveArtist : artist.archiveArtist;
    mutation.mutate(userId, {
      onSuccess: () => toast(artist.isSaved ? '저장을 취소했어요' : '작가를 저장했어요'),
      onError: (error) => toast(getErrorMessage(error, '작가를 저장하지 못했어요')),
    });
  };

  if (profileQuery.isError && !header) {
    return (
      <ErrorView
        message={getErrorMessage(profileQuery.error, '작가 정보를 불러오지 못했어요.')}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const hasExhibitions = artist.exhibitions.length > 0;
  const hasWorks = artist.works.length > 0;
  const isContentPending = artist.isExhibitionsPending || artist.isWorksPending;

  return (
    <div className="min-h-dvh bg-primary-white pb-12">
      {loginModal}

      {/* 768px 미만은 뒤로가기만, 이상은 로고 · 검색 헤더 */}
      <header className="sticky top-0 z-30 border-b border-bg-tertiary bg-primary-white pt-safe-area-top tablet:hidden">
        <div className="flex h-14 items-center pl-3">
          <button
            aria-label="뒤로가기"
            className="grid size-10 place-items-center rounded-circle text-icon-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus active:scale-94"
            onClick={() => flowBack()}
            type="button"
          >
            <BackIcon />
          </button>
        </div>
      </header>
      <DetailTopBar className="top-0" />

      <main className="mx-auto max-w-310 px-gutter desktop:grid desktop:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] desktop:items-start desktop:gap-x-18 desktop:pt-10">
        <div className="desktop:sticky desktop:top-24">
          {header ? (
            <ArtistProfileHeader
              action={
                artist.isOwner
                  ? { kind: 'edit', to: '/edit-artist-profile' }
                  : {
                      kind: 'save',
                      isSaved: artist.isSaved,
                      isPending: artist.isSavePending,
                      onToggle: handleToggleSave,
                    }
              }
              {...header}
            />
          ) : (
            <ArtistProfileHeaderSkeleton />
          )}
        </div>

        <div className="min-w-0">
          {isContentPending && !hasExhibitions && !hasWorks ? (
            <div
              aria-busy="true"
              aria-label="작가의 전시와 작품을 불러오는 중"
              className="pt-8 desktop:pt-0"
            >
              <SkeletonList count={2}>{() => <ArtistExhibitionRowSkeleton />}</SkeletonList>
              <div className={WORK_GRID_CLASS}>
                <SkeletonList count={2}>{() => <ArtistWorkCardSkeleton />}</SkeletonList>
              </div>
            </div>
          ) : !hasExhibitions && !hasWorks ? (
            <p className="typography-body-lg-medium py-14 text-center text-tertiary">
              아직 디유에 올린 전시와 작품이 없어요
            </p>
          ) : (
            <>
              {hasExhibitions && (
                <ArtistProfileSection
                  items={artist.exhibitions}
                  limit={EXHIBITION_LIMIT}
                  listClassName={EXHIBITION_LIST_CLASS}
                  moreLabel="전시 모두 보기"
                  renderItem={(exhibition, index) => (
                    <li className="animate-rise" key={exhibition.key} style={staggerStyle(index)}>
                      <ArtistExhibitionRow exhibition={exhibition} />
                    </li>
                  )}
                  title="전시"
                />
              )}
              {hasWorks && (
                <ArtistProfileSection
                  items={artist.works}
                  limit={WORK_LIMIT}
                  listClassName={WORK_GRID_CLASS}
                  moreLabel="작품 모두 보기"
                  renderItem={(work, index) => (
                    <li className="animate-rise" key={work.key} style={staggerStyle(index)}>
                      <ArtistWorkCard work={work} />
                    </li>
                  )}
                  title="작품"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

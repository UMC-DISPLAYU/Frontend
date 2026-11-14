import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ConfirmDialog, ErrorView } from '@/components/common';
import { ReceivedInvitationsFlow, useReceivedInvitationsSheet } from '@/components/invitation';
import { PageContainer } from '@/components/layout';
import {
  ARCHIVE_PANEL_ID,
  ArchiveArtistRow,
  ArchiveArtistRowSkeleton,
  ArchiveArtworkCard,
  ArchiveArtworkCardSkeleton,
  ArchiveEmpty,
  ArchiveExhibitionCard,
  ArchiveExhibitionCardSkeleton,
  archiveTabId,
  ArchiveTabs,
  GridIcon,
  MailIcon,
  MyActivityRow,
  MyArtistCard,
  MyPageTopBar,
  PlusSquareIcon,
  SettingsDrawer,
  useMyArchive,
  useMyArtistSummary,
} from '@/components/mypage';
import { Skeleton, SkeletonList } from '@/components/ui';
import { useUnarchiveArtist } from '@/hooks/queries/useArchive';
import { useLogout } from '@/hooks/queries/useAuth';
import { useMyDisplayInvitations } from '@/hooks/queries/useDisplayInvitations';
import { useDeleteUserMe, useUserMe } from '@/hooks/queries/useUserProfile';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useArtistPolicy, useDisplayCreatePolicy } from '@/hooks/usePolicy';
import { useReplaceSearchParams } from '@/hooks/useReplaceSearchParams';
import { toast } from '@/stores/toastStore';
import type { TabKey } from '@/types/mypage';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';
import { staggerStyle } from '@/utils/stagger';

const GRID_CLASS = 'grid grid-cols-2 gap-x-3 gap-y-6 tablet:grid-cols-3';

const EMPTY_COPY: Record<TabKey, { title: string; linkLabel: string; linkTo: string }> = {
  exhibition: {
    title: '마음에 드는 전시를 모아 보세요',
    linkLabel: '전시 둘러보기',
    linkTo: '/search',
  },
  artwork: {
    title: '마음에 드는 작품을 모아 보세요',
    linkLabel: '작품 둘러보기',
    linkTo: '/search?view=artwork',
  },
  artist: {
    title: '마음에 드는 작가를 모아 보세요',
    linkLabel: '전시 둘러보기',
    linkTo: '/search',
  },
};

type DialogKey = 'verify' | 'logout' | 'withdraw' | 'withdrawBlocked';

const parseTab = (value: string | null): TabKey =>
  value === 'artwork' || value === 'artist' ? value : 'exhibition';

export function MyPage() {
  const navigate = useNavigate();
  const [searchParams, replaceSearchParams] = useReplaceSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKey | null>(null);

  const userQuery = useUserMe();
  const user = userQuery.data;
  const canViewArtist = hasPermission(useArtistPolicy(), 'view');
  const canCreateDisplay = hasPermission(useDisplayCreatePolicy(), 'create');

  const artistSummary = useMyArtistSummary({ userId: user?.id, enabled: canViewArtist });
  const { data: invitationsData } = useMyDisplayInvitations();
  const invitationCount = invitationsData?.invitations?.length ?? 0;
  const invitationsSheet = useReceivedInvitationsSheet();

  const archive = useMyArchive(activeTab);
  const unarchiveArtist = useUnarchiveArtist();
  const logoutMutation = useLogout();
  const deleteUserMutation = useDeleteUserMe();

  const pagedQuery =
    activeTab === 'artwork'
      ? archive.artworksQuery
      : activeTab === 'artist'
        ? archive.artistsQuery
        : null;
  const triggerRef = useInfiniteScroll({
    hasNextPage: pagedQuery?.hasNextPage && !pagedQuery.isError,
    isFetchingNextPage: pagedQuery?.isFetchingNextPage ?? false,
    fetchNextPage: () => void pagedQuery?.fetchNextPage(),
    rootMargin: '0px 0px 400px 0px',
  });

  const handleTabChange = (tab: TabKey) => {
    replaceSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'exhibition') next.delete('tab');
      else next.set('tab', tab);
      return next;
    });
  };

  const handleNewExhibition = () => {
    if (canCreateDisplay) {
      navigate('/exhibition/register');
      return;
    }
    setDialog('verify');
  };

  const handleLogout = () => {
    logoutMutation.mutate(
      {},
      {
        onSettled: () => navigate('/home', { replace: true }),
      },
    );
  };

  const handleWithdraw = () => {
    deleteUserMutation.mutate(undefined, {
      onSuccess: () => navigate('/home', { replace: true }),
    });
  };

  const handleUnarchiveArtist = (artistUserId: number) => {
    unarchiveArtist.mutate(artistUserId, {
      onSuccess: () => toast('저장을 취소했어요'),
      onError: (error) => toast(getErrorMessage(error, '저장을 취소하지 못했어요')),
    });
  };

  if (userQuery.isError) {
    return (
      <ErrorView
        message={getErrorMessage(userQuery.error, '프로필 정보를 불러오지 못했어요.')}
        onRetry={() => void userQuery.refetch()}
      />
    );
  }

  const nickname = user?.nickname || user?.name || '';

  const renderArchiveList = () => {
    const query =
      activeTab === 'exhibition'
        ? archive.exhibitionsQuery
        : activeTab === 'artwork'
          ? archive.artworksQuery
          : archive.artistsQuery;
    const items =
      activeTab === 'exhibition'
        ? archive.exhibitions
        : activeTab === 'artwork'
          ? archive.artworks
          : archive.artists;

    if (query.isPending) {
      if (activeTab === 'artist') {
        return (
          <div aria-busy="true" aria-label="저장한 작가를 불러오는 중" className="mt-2">
            <SkeletonList count={4}>{() => <ArchiveArtistRowSkeleton />}</SkeletonList>
          </div>
        );
      }
      return (
        <ul aria-busy="true" aria-label="보관함을 불러오는 중" className={cn('mt-4', GRID_CLASS)}>
          <SkeletonList count={4}>
            {() => (
              <li aria-hidden="true">
                {activeTab === 'exhibition' ? (
                  <ArchiveExhibitionCardSkeleton />
                ) : (
                  <ArchiveArtworkCardSkeleton />
                )}
              </li>
            )}
          </SkeletonList>
        </ul>
      );
    }

    if (query.isError && items.length === 0) {
      return (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(query.error, '보관함을 불러오지 못했어요.')}
          onRetry={() => void query.refetch()}
        />
      );
    }

    if (items.length === 0) {
      return (
        <ArchiveEmpty
          {...EMPTY_COPY[activeTab]}
          isRecommendationPending={archive.isRecommendationPending}
          recommendationLabel={
            activeTab === 'artwork' ? '지금 인기 있는 작품' : '지금 인기 있는 전시'
          }
          recommendations={archive.recommendations}
        />
      );
    }

    if (activeTab === 'artist') {
      return (
        <ul className="mt-2">
          {archive.artists.map(({ userId, view }, index) => (
            <li className="animate-rise" key={view.key} style={staggerStyle(index)}>
              <ArchiveArtistRow
                artist={view}
                isRemoving={unarchiveArtist.isPending && unarchiveArtist.variables === userId}
                onUnarchive={() => handleUnarchiveArtist(userId)}
              />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className={cn('mt-4', GRID_CLASS)}>
        {activeTab === 'exhibition'
          ? archive.exhibitions.map((exhibition, index) => (
              <li className="animate-rise" key={exhibition.key} style={staggerStyle(index)}>
                <ArchiveExhibitionCard exhibition={exhibition} />
              </li>
            ))
          : archive.artworks.map((artwork, index) => (
              <li className="animate-rise" key={artwork.key} style={staggerStyle(index)}>
                <ArchiveArtworkCard artwork={artwork} />
              </li>
            ))}
      </ul>
    );
  };

  return (
    <div className="-mb-navbar-clearance min-h-dvh bg-primary-white pb-37.5">
      <PageContainer
        className="pt-[max(12px,env(safe-area-inset-top))] tablet:pt-[max(12px,env(safe-area-inset-top))] desktop:grid desktop:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] desktop:items-start desktop:gap-x-16 desktop:pt-8"
        variant="list"
      >
        <h1 className="sr-only">마이</h1>

        <div className="desktop:sticky desktop:top-6">
          {user ? (
            <MyPageTopBar
              nickname={nickname}
              onOpenMenu={() => setIsDrawerOpen(true)}
              onOpenNotifications={() => toast('알림함은 준비 중이에요')}
              profileImageUrl={user.profileImageUrl}
            />
          ) : (
            <div aria-hidden="true" className="flex h-11 items-center gap-2">
              <Skeleton className="size-9 rounded-circle" />
              <Skeleton className="h-6 w-24 rounded-4" />
            </div>
          )}

          {canViewArtist && user && (
            <div className="mt-6">
              <MyArtistCard
                artistName={artistSummary.artistName || nickname}
                summary={artistSummary.summary}
                to={`/artist/${user.id}`}
              />
            </div>
          )}

          <ul aria-label="전시 활동" className="mt-3">
            {canViewArtist && (
              <MyActivityRow icon={<GridIcon />} label="내 전시 관리" to="/display-management" />
            )}
            {invitationCount > 0 && (
              <MyActivityRow
                count={invitationCount}
                icon={<MailIcon />}
                label="받은 초대"
                onClick={invitationsSheet.open}
              />
            )}
            <MyActivityRow
              icon={<PlusSquareIcon />}
              label="새 전시 등록"
              onClick={handleNewExhibition}
            />
          </ul>
        </div>

        <section aria-labelledby="archive-title" className="mt-8 desktop:mt-0">
          <h2 className="typography-body-xxl-semibold text-primary" id="archive-title">
            보관함
          </h2>
          <div className="mt-3">
            <ArchiveTabs activeTab={activeTab} counts={archive.counts} onChange={handleTabChange} />
          </div>
          <div aria-labelledby={archiveTabId(activeTab)} id={ARCHIVE_PANEL_ID} role="tabpanel">
            {renderArchiveList()}
            {pagedQuery?.hasNextPage && <div aria-hidden="true" className="h-1" ref={triggerRef} />}
          </div>
        </section>
      </PageContainer>

      {user && (
        <SettingsDrawer
          isVerified={user.isVerified}
          nickname={nickname}
          onClose={() => setIsDrawerOpen(false)}
          onLogout={() => setDialog('logout')}
          onWithdraw={() =>
            setDialog(artistSummary.isLeaderOfAnyDisplay ? 'withdrawBlocked' : 'withdraw')
          }
          open={isDrawerOpen}
          profileImageUrl={user.profileImageUrl}
          schoolName={artistSummary.schoolName}
        />
      )}

      <ReceivedInvitationsFlow onClose={invitationsSheet.close} open={invitationsSheet.isOpen} />

      <ConfirmDialog
        cancelLabel="나중에"
        confirmLabel="작가 인증하기"
        description={'학교 이메일로 인증한 뒤\n전시를 등록할 수 있어요'}
        onCancel={() => setDialog(null)}
        onConfirm={() => navigate('/artist-verification', { replace: true })}
        open={dialog === 'verify'}
        title={
          <>
            전시를 등록하려면
            <br />
            작가 인증이 필요해요
          </>
        }
      />
      <ConfirmDialog
        confirmLabel="로그아웃하기"
        description={'로그아웃 후에도 저장한 전시와 기록은\n계정에 유지돼요'}
        isPending={logoutMutation.isPending}
        onCancel={() => setDialog(null)}
        onConfirm={handleLogout}
        open={dialog === 'logout'}
        pendingLabel="로그아웃 중..."
        title="로그아웃할까요?"
      />
      <ConfirmDialog
        confirmLabel="탈퇴하기"
        description="참여 중인 전시에서도 나가게 돼요"
        errorMessage={
          deleteUserMutation.isError
            ? getErrorMessage(deleteUserMutation.error, '탈퇴하지 못했어요. 다시 시도해 주세요.')
            : null
        }
        isPending={deleteUserMutation.isPending}
        onCancel={() => {
          deleteUserMutation.reset();
          setDialog(null);
        }}
        onConfirm={handleWithdraw}
        open={dialog === 'withdraw'}
        pendingLabel="탈퇴하는 중..."
        title="탈퇴할까요?"
        warning={{
          title: '삭제 안내',
          description: '작가 프로필과 작가로 연결된 작품은 복구할 수 없어요',
        }}
      />
      <ConfirmDialog
        cancelLabel="닫기"
        confirmLabel="전시 관리로 이동"
        description={'대표로 있는 전시를 위임하거나 삭제한 뒤\n탈퇴할 수 있어요'}
        onCancel={() => setDialog(null)}
        onConfirm={() => navigate('/display-management', { replace: true })}
        open={dialog === 'withdrawBlocked'}
        title="탈퇴할 수 없어요"
      />
    </div>
  );
}

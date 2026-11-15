import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { UpdateDisplayReservationRequestDto } from '@/api/dto';
import { DisplaySummaryCard, ErrorView } from '@/components/common';
import {
  DisplayHubBlocks,
  DisplayHubBottomBar,
  DisplayHubConfirmDialog,
  DisplayHubHeader,
  type DisplayHubStatus,
  DisplayHubStatusBanner,
  DisplayHubVisibility,
  getDisplayHubButtonClass,
  getDisplayHubStatus,
} from '@/components/display-hub';
import { PageContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import { useDisplayArtworks } from '@/hooks/queries/useDisplayArtworks';
import {
  useCancelDisplayScreening,
  useHideDisplay,
  usePublishDisplay,
} from '@/hooks/queries/useDisplayBrowse';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useDisplayRejectionReason } from '@/hooks/queries/useDisplayRejectionReason';
import { useUpdateDisplayReservation } from '@/hooks/queries/useDisplayReservation';
import { useSkeleton } from '@/hooks/useSkeleton';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

// 프로토타입 hub.html: 폰 · 태블릿은 한 줄로 쌓고, 노트북(900~)은 왼쪽에 요약 · 상태 · 버튼, 오른쪽에 나머지를 둔다
const GRID_CLASS =
  'flex flex-1 flex-col desktop:grid desktop:grid-cols-[380px_minmax(0,1fr)] desktop:grid-rows-[auto_auto_1fr] desktop:items-start desktop:gap-x-14 desktop:pt-2';
const LEFT_TOP_CLASS = 'desktop:col-start-1 desktop:row-start-1';
const LEFT_MIDDLE_CLASS = 'desktop:col-start-1 desktop:row-start-2';
const RIGHT_CLASS = 'desktop:col-start-2 desktop:row-span-3 desktop:row-start-1';

type HubDialog = 'publish' | 'hide' | 'cancel';

const PUBLISH_NOTES = [
  '작품이나 팀원이 없어도 요청할 수 있어요',
  '심사 중에도 내용을 수정할 수 있어요',
  '승인된 시점부터 관람객에게 공개돼요',
  '공개 후에도 내용을 수정할 수 있어요',
];

const getHubAction = (
  status: DisplayHubStatus,
): { label: string; dialog: HubDialog; isPrimary: boolean } => {
  if (status === 'PUBLISHED') {
    return { label: '비공개로 전환', dialog: 'hide', isPrimary: false };
  }
  if (status === 'PENDING_REVIEW') {
    return { label: '요청 취소하기', dialog: 'cancel', isPrimary: false };
  }
  return { label: '등록 요청하기', dialog: 'publish', isPrimary: true };
};

function DisplayHubSkeleton() {
  return (
    <main aria-label="전시 관리를 불러오는 중" aria-busy="true" className={GRID_CLASS}>
      <Skeleton className={cn('mt-2 h-[147px] rounded-12', LEFT_TOP_CLASS)} />
      <Skeleton className={cn('mt-4 h-[86px] rounded-12', LEFT_MIDDLE_CLASS)} />
      <div className={cn('flex flex-col', RIGHT_CLASS)}>
        <Skeleton className="mt-5 h-[143px] rounded-12 desktop:mt-0" />
        <Skeleton className="mt-3 h-[124px] rounded-12" />
      </div>
    </main>
  );
}

export function DisplayHubPage() {
  const navigate = useNavigate();
  const { displayId: displayIdParam } = useParams();
  const displayId = Number(displayIdParam);

  const { data: display, isPending, refetch } = useDisplayDetail(displayId);
  const { showSkeleton } = useSkeleton(isPending);
  const { data: members } = useDisplayMembers(displayId);
  const { data: artworks } = useDisplayArtworks(displayId);

  const status = getDisplayHubStatus(display?.status);
  const { data: rejection } = useDisplayRejectionReason(displayId, status === 'REJECTED');

  const publish = usePublishDisplay();
  const hide = useHideDisplay();
  const reservation = useUpdateDisplayReservation(displayId);
  const cancelReview = useCancelDisplayScreening();
  const [openDialog, setOpenDialog] = useState<HubDialog | null>(null);

  const closePublishDialog = () => {
    if (publish.isPending) return;
    setOpenDialog(null);
    publish.reset();
  };

  const closeHideDialog = () => {
    if (hide.isPending) return;
    setOpenDialog(null);
    hide.reset();
  };

  const closeCancelDialog = () => {
    if (cancelReview.isPending) return;
    setOpenDialog(null);
    cancelReview.reset();
  };

  const confirmCancelReview = () => {
    const screeningId = display?.currentScreeningId;
    if (screeningId == null) {
      // 심사 중으로 보이지만 심사 ID가 없으면 화면 정보가 오래된 것이라 다시 불러온다.
      setOpenDialog(null);
      toast('전시 상태가 바뀌었어요. 다시 확인해주세요.');
      void refetch();
      return;
    }
    cancelReview.mutate(
      { displayId, screeningId },
      {
        onSuccess: () => {
          setOpenDialog(null);
          toast('등록 요청을 취소했어요');
        },
      },
    );
  };

  const confirmPublish = () => {
    publish.mutate(displayId, {
      onSuccess: () => navigate(`/exhibition/${displayId}/manage/requested`, { replace: true }),
    });
  };

  const confirmHide = () => {
    hide.mutate(displayId, {
      onSuccess: () => {
        setOpenDialog(null);
        toast('비공개로 전환했어요');
      },
    });
  };

  const changeReservation = (next: UpdateDisplayReservationRequestDto) => {
    reservation.mutate(next, {
      onError: (error) => toast(getErrorMessage(error, '공개 시점을 저장하지 못했어요.')),
    });
  };

  const hubAction = display ? getHubAction(status) : null;

  const renderContent = () => {
    if (showSkeleton) return <DisplayHubSkeleton />;

    if (display) {
      const contentOpen = reservation.isPending ? reservation.variables : display;

      return (
        <main className={GRID_CLASS}>
          <DisplaySummaryCard display={display} status={status} className={LEFT_TOP_CLASS} />
          <DisplayHubStatusBanner
            status={status}
            rejectionReason={status === 'REJECTED' ? rejection?.rejectionReason : undefined}
            className={LEFT_MIDDLE_CLASS}
          />
          <div className={RIGHT_CLASS}>
            <DisplayHubBlocks
              display={display}
              artworkCount={artworks?.artworks?.length ?? 0}
              acceptedCount={members?.memberAccept.length ?? 0}
              pendingCount={members?.memberPending.length ?? 0}
            />
            <DisplayHubVisibility
              artworkContentOpen={contentOpen.artworkContentOpen}
              exhibitionContentOpen={contentOpen.exhibitionContentOpen}
              startDate={display.period.startDate}
              disabled={reservation.isPending}
              onChange={changeReservation}
              className="mt-8 desktop:mt-10"
            />
            <div aria-hidden="true" className="h-6 desktop:hidden" />
          </div>
          {hubAction && (
            // 폰 · 태블릿은 화면 아래에 붙는 버튼(프로토타입 `.cta`), 노트북은 왼쪽 상태 안내 아래에 둔다
            <DisplayHubBottomBar
              staticOnDesktop
              className="desktop:static desktop:col-start-1 desktop:row-start-3 desktop:mt-2 desktop:self-start desktop:bg-none desktop:pt-4 desktop:pb-0"
            >
              <button
                type="button"
                onClick={() => setOpenDialog(hubAction.dialog)}
                className={getDisplayHubButtonClass(hubAction.isPrimary ? 'primary' : 'soft')}
              >
                {hubAction.label}
              </button>
            </DisplayHubBottomBar>
          )}
        </main>
      );
    }

    return (
      <ErrorView
        fullScreen={false}
        message="전시 정보를 불러오지 못했어요."
        onRetry={() => void refetch()}
      />
    );
  };

  return (
    // 프로토타입은 넓은 화면에서도 콘텐츠 양옆이 흰색이라 페이지 전체를 흰 배경으로 감싼다
    <div className="min-h-dvh bg-primary-white">
      <PageContainer
        variant="form"
        className="typography-body-lg-medium max-w-[480px] text-primary desktop:max-w-list"
      >
        <DisplayHubHeader title="전시 관리" />
        {renderContent()}

        <DisplayHubConfirmDialog
          open={openDialog === 'publish'}
          title="전시 등록을 요청할까요?"
          list={PUBLISH_NOTES}
          confirmLabel="등록 요청하기"
          pendingLabel="요청 중…"
          isPending={publish.isPending}
          errorMessage={
            publish.error
              ? getErrorMessage(publish.error, '등록을 요청하지 못했어요. 다시 시도해주세요.')
              : null
          }
          onCancel={closePublishDialog}
          onConfirm={confirmPublish}
        />
        <DisplayHubConfirmDialog
          open={openDialog === 'hide'}
          title="비공개로 전환할까요?"
          description="전시가 준비 중 상태로 돌아가요"
          warning={{
            title: '다시 공개하려면 등록 요청이 필요해요',
            description: '비공개 중에는 검색과 저장 보관함에서 보이지 않아요',
          }}
          confirmLabel="비공개로 전환"
          pendingLabel="전환 중…"
          isPending={hide.isPending}
          errorMessage={
            hide.error
              ? getErrorMessage(hide.error, '비공개로 전환하지 못했어요. 다시 시도해주세요.')
              : null
          }
          onCancel={closeHideDialog}
          onConfirm={confirmHide}
        />
        <DisplayHubConfirmDialog
          open={openDialog === 'cancel'}
          title="등록 요청을 취소할까요?"
          description={
            '심사 요청을 철회하고 준비 중 상태로 돌아가요\n작성한 내용은 그대로 유지돼요'
          }
          confirmLabel="요청 취소하기"
          pendingLabel="취소 중…"
          cancelLabel="돌아가기"
          isPending={cancelReview.isPending}
          errorMessage={
            cancelReview.error
              ? getErrorMessage(cancelReview.error, '요청을 취소하지 못했어요. 다시 시도해주세요.')
              : null
          }
          onCancel={closeCancelDialog}
          onConfirm={confirmCancelReview}
        />
      </PageContainer>
    </div>
  );
}

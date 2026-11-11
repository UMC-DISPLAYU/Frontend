import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { UpdateDisplayReservationRequestDto } from '@/api/dto';
import { BottomFixedBar, ConfirmDialog, ErrorView } from '@/components/common';
import {
  DisplayHubBlocks,
  type DisplayHubStatus,
  DisplayHubSummary,
  DisplayHubVisibility,
  getDisplayHubStatus,
} from '@/components/display-hub';
import { WorkHeader } from '@/components/exhibition-work';
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
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

const GRID_CLASS =
  'flex flex-col gap-6 pb-10 desktop:grid desktop:grid-cols-[380px_minmax(0,1fr)] desktop:items-start desktop:gap-14';

type HubDialog = 'publish' | 'hide' | 'cancel';

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
      <div className="flex flex-col gap-4">
        <Skeleton className="h-33 rounded-12" />
        <Skeleton className="h-22 rounded-12" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-34 rounded-12" />
        <Skeleton className="h-28 rounded-12" />
      </div>
    </main>
  );
}

export function DisplayHubPage() {
  const navigate = useNavigate();
  const { displayId: displayIdParam } = useParams();
  const displayId = Number(displayIdParam);

  const { data: display, isPending, refetch } = useDisplayDetail(displayId);
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
  const actionButton = hubAction ? (
    <button
      type="button"
      onClick={() => setOpenDialog(hubAction.dialog)}
      className={cn(
        'typography-body-lg-semibold h-11 w-full rounded-12 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99',
        hubAction.isPrimary
          ? 'bg-interactive-primary text-interactive-inverse hover:bg-interactive-primary-hover'
          : 'bg-secondary text-primary hover:bg-tertiary',
      )}
    >
      {hubAction.label}
    </button>
  ) : null;

  const renderContent = () => {
    if (display) {
      const contentOpen = reservation.isPending ? reservation.variables : display;

      return (
        <main className={GRID_CLASS}>
          <div className="flex flex-col gap-6">
            <DisplayHubSummary
              display={display}
              status={status}
              rejectionReason={status === 'REJECTED' ? rejection?.rejectionReason : undefined}
            />
            {actionButton && <div className="hidden desktop:block">{actionButton}</div>}
          </div>
          <div className="flex flex-col gap-3">
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
            />
            {actionButton && (
              <div className="hidden pt-3 tablet:block desktop:hidden">{actionButton}</div>
            )}
          </div>
        </main>
      );
    }

    if (isPending) return <DisplayHubSkeleton />;

    return (
      <ErrorView
        fullScreen={false}
        message="전시 정보를 불러오지 못했어요."
        onRetry={() => void refetch()}
      />
    );
  };

  return (
    <PageContainer variant="form" className="bg-primary-white text-primary desktop:max-w-list">
      <WorkHeader title="전시 관리" />
      {renderContent()}

      {actionButton && (
        <div className="tablet:hidden">
          <BottomFixedBar container="form">{actionButton}</BottomFixedBar>
        </div>
      )}

      <ConfirmDialog
        open={openDialog === 'publish'}
        title="전시 등록을 요청할까요?"
        description={
          '· 작품이나 팀원이 없어도 요청할 수 있어요\n· 심사 중에도 내용을 수정할 수 있어요\n· 승인된 시점부터 관람객에게 공개돼요\n· 공개 후에도 내용을 수정할 수 있어요'
        }
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
      <ConfirmDialog
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
      <ConfirmDialog
        open={openDialog === 'cancel'}
        title="등록 요청을 취소할까요?"
        description={'심사 요청을 철회하고 준비 중 상태로 돌아가요\n작성한 내용은 그대로 유지돼요'}
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
  );
}

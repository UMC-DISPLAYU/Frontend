import { useEffect, useId, useRef, useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { MyDisplayInvitationDto } from '@/api/dto';
import {
  useMyDisplayInvitations,
  useRejectDisplayInvitation,
} from '@/hooks/queries/useDisplayInvitations';
import { useFlowBack } from '@/hooks/useFlowBack';
import type { Invitation } from '@/types/invitation';
import { cn } from '@/utils/cn';

const formatMonthDay = (date?: string) => {
  if (!date) return '-';

  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

const toInvitation = (item: MyDisplayInvitationDto): Invitation => ({
  id: String(item.invitationId),
  invitationId: item.invitationId,
  displayId: item.displayId,
  title: item.title,
  schoolDepartmentName: item.schoolDepartmentName ?? '',
  department: item.schoolDepartmentName ?? '',
  period: `${formatMonthDay(item.startDate)} - ${formatMonthDay(item.endDate)}`,
  placeName: item.placeName ?? '',
  leaderName: item.leaderName ?? '',
  userNickname: item.userNickname ?? '',
  posterUrl: item.thumbnailUrl ?? null,
});

interface InvitationCardProps {
  item: Invitation;
  highlighted?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

function InvitationCard({ item, highlighted = false, onAccept, onReject }: InvitationCardProps) {
  const leaderInfo = item.leaderName || '';
  const nicknameInfo = item.userNickname ? `(${item.userNickname})` : '';
  const inviterText = `초대 · ${leaderInfo}${nicknameInfo}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-3.5 rounded-[24px] bg-card p-4 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        highlighted && 'outline outline-1 outline-offset-[-1px] outline-line-active',
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-[108px] max-h-[132px] h-[132px] shrink-0 overflow-hidden rounded-xl bg-box shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]">
          {item.posterUrl && (
            <img src={item.posterUrl} alt={item.title} className="size-full object-cover" />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-start items-start gap-2.5 min-w-0">
          {/* 1. title */}
          <h3 className="self-stretch justify-start text-neutral-900 typo-body-md-bold line-clamp-1">
            {item.title}
          </h3>

          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch flex flex-col justify-start items-start">
              {/* 2. schoolDepartmentName */}
              <p className="self-stretch justify-start text-neutral-800 typo-body-xs-regular line-clamp-1">
                {item.schoolDepartmentName || ''}
              </p>
              {/* 3. 날짜 (period) */}
              <p className="self-stretch justify-start text-neutral-500 typo-body-xs-regular">
                {item.period}
              </p>
            </div>

            {/* 4. placeName */}
            <div className="self-stretch h-4 inline-flex justify-start items-center gap-2">
              <div className="h-4 flex justify-start items-end gap-2">
                <p className="w-56 justify-start text-neutral-400 typo-body-xxs-regular line-clamp-1">
                  {item.placeName || ''}
                </p>
              </div>
            </div>

            {/* 5. 초대 leaderName(userNickname) */}
            <div className="h-5 inline-flex justify-start items-end gap-2">
              <p className="w-56 justify-start text-neutral-600 typo-body-sm-regular line-clamp-1">
                {inviterText}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onAccept}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-black py-3 typo-body-sm-semibold text-white transition-opacity active:opacity-80"
        >
          초대받기
        </button>
        <button
          type="button"
          onClick={onReject}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-gray py-3 typo-body-sm-semibold text-main transition-opacity active:opacity-80"
        >
          거절하기
        </button>
      </div>
    </div>
  );
}

interface RejectModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function RejectModal({ isOpen, onConfirm, onCancel }: RejectModalProps) {
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelButtonRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="초대 거절"
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40"
    >
      <div
        ref={dialogRef}
        className="relative w-80 h-48 bg-neutral-50/40 rounded-[20px] shadow-[inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] overflow-hidden"
      >
        <div className="absolute inset-x-6 top-6 flex flex-col items-center gap-2">
          <h3 className="w-full text-center typo-body-xl-bold text-modal-title">
            초대를 거절할까요?
          </h3>
          <p id={descriptionId} className="w-full text-center typo-body-sm-regular text-modal-desc">
            거절하면 이 전시의 팀원으로 참여할 수 없어요.
            <br />
            다시 참여하려면 대표자가 다시 초대해야 해요.
          </p>
        </div>
        <div className="absolute left-5 w-full top-[122px] flex justify-start items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-34 h-11 bg-modal-btn-hover-bg rounded-full flex justify-center items-center gap-2.5"
          >
            <span className="typo-body-lg-regular text-modal-btn-hover-fg">확인</span>
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="w-34 h-11 bg-modal-btn-bg rounded-full flex justify-center items-center gap-2.5"
          >
            <span className="typo-body-lg-regular text-modal-btn-fg">취소</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvitationRequestPage() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError } = useMyDisplayInvitations();
  /* 초대 링크를 타고 들어왔다면 어떤 전시의 초대인지 표시해줍니다. */
  const highlightedDisplayId = Number(searchParams.get('displayId')) || null;
  const rejectInvitation = useRejectDisplayInvitation();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const invitations = (data?.invitations ?? [])
    .filter((item) => item.status !== 'REJECTED')
    .map((item) => toInvitation(item));

  const handleAccept = (item: Invitation) => {
    navigate(`/invitations/${item.id}/artist-name`, { state: { invitation: item } });
  };

  const handleReject = (item: Invitation) => {
    setSelectedInvitation(item);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedInvitation) return;

    rejectInvitation.mutate(selectedInvitation.invitationId, {
      onSuccess: () => {
        setRejectModalOpen(false);
        setSelectedInvitation(null);
      },
    });
  };

  const handleRejectCancel = () => {
    setRejectModalOpen(false);
    setSelectedInvitation(null);
  };

  return (
    <>
      <div className="max-w-md mx-auto h-dvh bg-page flex flex-col">
        <header className="flex items-center gap-3 px-5 pt-4 pb-3">
          <button type="button" onClick={() => flowBack()} aria-label="뒤로가기" className="-ml-1">
            <ChevronLeft className="size-7 text-main" strokeWidth={2} />
          </button>
          <h1 className="typo-body-xl-bold text-main">초대 요청</h1>
        </header>

        <section className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 pt-3">
          <div className="flex flex-col items-end gap-1 pb-4">
            <div className="flex w-full flex-col gap-1">
              <h2 className="typo-body-md-bold text-main">받은 전시 팀원 초대</h2>
              <p className="typo-body-xs-regular text-hint">
                팀원으로 초대받은 전시를 확인하고 참여 여부를 선택해보세요.
              </p>
            </div>
            <span className="typo-body-xs-regular text-faint">초대 {invitations.length}건</span>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading && (
              <div className="rounded-2xl bg-card px-4 py-8 text-center typo-body-sm-regular text-hint">
                초대 목록을 불러오는 중이에요.
              </div>
            )}

            {isError && (
              <div className="rounded-2xl bg-card px-4 py-8 text-center typo-body-sm-regular text-hint">
                초대 목록을 불러오지 못했어요.
              </div>
            )}

            {!isLoading && !isError && invitations.length === 0 && (
              <div className="rounded-2xl bg-card px-4 py-8 text-center typo-body-sm-regular text-hint">
                받은 초대가 없어요.
              </div>
            )}

            {invitations.map((item) => (
              <InvitationCard
                key={item.id}
                item={item}
                highlighted={
                  highlightedDisplayId !== null && item.displayId === highlightedDisplayId
                }
                onAccept={() => handleAccept(item)}
                onReject={() => handleReject(item)}
              />
            ))}
          </div>
        </section>
      </div>

      <RejectModal
        isOpen={rejectModalOpen}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
      />
    </>
  );
}

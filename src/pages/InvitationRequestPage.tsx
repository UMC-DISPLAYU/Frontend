import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { DisplayInvitationDto } from '@/api/dto';
import {
  useMyDisplayInvitations,
  useRejectDisplayInvitation,
} from '@/hooks/queries/useDisplayInvitations';
import type { Invitation } from '@/types/invitation';
import { cn } from '@/utils/cn';

const formatMonthDay = (date?: string) => {
  if (!date) return '-';

  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

const toInvitation = (item: DisplayInvitationDto): Invitation => ({
  id: String(item.invitationId),
  invitationId: item.invitationId,
  displayId: item.displayId,
  title: item.title,
  department: item.schoolDepartmentName ?? '',
  period: `${formatMonthDay(item.startedAt)} - ${formatMonthDay(item.endedAt)}`,
  gallery: '',
  inviter: '',
  posterUrl: item.posterImageUrl ?? null,
});

interface InvitationCardProps {
  item: Invitation;
  highlighted?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

function InvitationCard({ item, highlighted = false, onAccept, onReject }: InvitationCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        highlighted && 'outline outline-1 outline-offset-[-1px] outline-line-active',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-box shadow-[2px_4px_18px_0px_rgba(67,0,209,0.04)]">
          {item.posterUrl && (
            <img src={item.posterUrl} alt={item.title} className="size-full object-cover" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <h3 className="typo-body-md-bold text-main">{item.title}</h3>

          <div className="flex flex-col">
            <span className="typo-body-xs-regular text-sub700">{item.department}</span>
            <span className="typo-body-xs-regular text-hint">{item.period}</span>
          </div>

          {item.gallery && <span className="typo-body-xxs-regular text-faint">{item.gallery}</span>}
          {item.inviter && <span className="typo-body-sm-regular text-sub600">{item.inviter}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onAccept}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-black py-3.5 typo-body-sm-regular text-white"
        >
          초대받기
        </button>
        <button
          type="button"
          onClick={onReject}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-bt-gray py-3.5 typo-body-sm-regular text-main"
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-80 h-48 relative bg-neutral-50/20 rounded-[20px] shadow-[2px_8px_18px_0px_rgba(4,0,250,0.06)] shadow-[inset_-3px_-3px_3px_-2px_rgba(241,241,241,0.60)] shadow-[inset_4px_4px_3px_-2px_rgba(255,255,255,1.00)] backdrop-blur-[10px] overflow-hidden">
        <div className="w-72 left-[24px] top-[24px] absolute inline-flex flex-col justify-center items-center gap-2">
          <div className="self-stretch text-center justify-start text-neutral-900 text-xl font-bold font-['Pretendard'] leading-7">
            초대를 거절할까요?
          </div>
          <div className="self-stretch text-center justify-start text-neutral-600 text-sm font-normal font-['Pretendard'] leading-5">
            거절하면 이 전시의 팀원으로 참여할 수 없어요. 다시 참여하려면 대표자가 다시 초대해야
            해요.
          </div>
        </div>
        <div className="left-[20px] top-[122px] absolute inline-flex justify-start items-center gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-32 h-11 py-3.5 bg-neutral-900 rounded-[100px] flex justify-center items-center gap-2.5"
          >
            <div className="justify-start text-white text-lg font-normal font-['Pretendard'] leading-6">
              확인
            </div>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-32 h-11 py-3.5 bg-neutral-200 rounded-[100px] flex justify-center items-center gap-2.5"
          >
            <div className="justify-start text-neutral-900 text-lg font-normal font-['Pretendard'] leading-6">
              취소
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvitationRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError } = useMyDisplayInvitations();
  /* 초대 링크를 타고 들어왔다면 어떤 전시의 초대인지 표시해줍니다. */
  const highlightedDisplayId = Number(searchParams.get('displayId')) || null;
  const rejectInvitation = useRejectDisplayInvitation();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const invitations = (data?.exhibitions ?? [])
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="-ml-1"
          >
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

import { Check, Info } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { BottomButton } from '@/components/common';
import { VISIBILITY_LABEL, type VisibilityType } from '@/constants/visibility';

interface ExhibitionCompleteState {
  type?: 'exhibition';
  title?: string;
  school?: string;
  department?: string;
  organizer?: string;
  placeName?: string;
  artworkVisibility?: VisibilityType;
  contentVisibility?: VisibilityType;
}

interface ArtworkCompleteState {
  type: 'artwork';
  title?: string;
  artistName?: string;
  registrantName?: string;
  registrantAccount?: string;
  qnaAssigneeName?: string;
  qnaAssigneeAccount?: string;
}

interface PersonalArtworkCompleteState {
  type: 'personalArtwork';
}

type CompleteState = ExhibitionCompleteState | ArtworkCompleteState | PersonalArtworkCompleteState;

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="typo-body-xs-regular shrink-0 text-faint">{label}</span>
      <span className="typo-body-xs-regular text-main">{value}</span>
    </div>
  );
}

function ArtworkSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="typo-body-xs-regular shrink-0 text-faint">{label}</span>
      <span className="typo-body-xs-regular text-main">{value}</span>
    </li>
  );
}

function formatPerson(name?: string, account?: string) {
  return [name, account].filter(Boolean).join(' · ') || '-';
}

// ----------------------------------------------------------------------
// Common Components
// ----------------------------------------------------------------------

function CompleteHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="mt-40 flex flex-col items-center gap-2.5">
      <div className="flex size-20 items-center justify-center rounded-full bg-box200">
        <div className="flex size-12 items-center justify-center rounded-full bg-dark">
          <Check className="size-6 text-white" strokeWidth={2.8} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <h1 className="typo-body-xl-bold text-center text-main">{title}</h1>
        <p className="typo-body-xs-regular text-center text-faint">{description}</p>
      </div>
    </div>
  );
}

function CompleteInfo({ message }: { message: string }) {
  return (
    <div className="mt-auto pt-12 pb-6">
      <div className="flex items-start gap-2 rounded-2xl bg-card p-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1} />
        <p className="typo-body-xs-regular text-faint">{message}</p>
      </div>
    </div>
  );
}

function CompleteButton({ onClick }: { onClick: () => void }) {
  return (
    <BottomButton type="button" onClick={onClick}>
      완료
    </BottomButton>
  );
}

// ----------------------------------------------------------------------
// Page Components
// ----------------------------------------------------------------------

export function ExhibitionRegisterComplete() {
  const navigate = useNavigate();
  const { displayId } = useParams();
  const { state } = useLocation() as { state: CompleteState | null };
  const isArtworkComplete = state?.type === 'artwork';
  const isPersonalArtworkComplete = state?.type === 'personalArtwork';
  const exhibitionState =
    !isArtworkComplete && !isPersonalArtworkComplete
      ? (state as ExhibitionCompleteState | null)
      : null;

  const affiliation = [
    exhibitionState?.school,
    exhibitionState?.organizer ?? exhibitionState?.department,
  ]
    .filter(Boolean)
    .join(' ');

  if (isArtworkComplete || isPersonalArtworkComplete) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
        <main className="flex flex-1 flex-col overflow-y-auto px-5 pb-8">
          <CompleteHeader
            title="작품등록이 완료되었어요"
            description={
              isPersonalArtworkComplete
                ? '등록된 작품은 마이페이지에서 확인할 수 있어요'
                : '등록된 작품은 전시 작업 페이지에서 확인할 수 있어요'
            }
          />

          {isArtworkComplete && (
            <section className="mt-14 rounded-2xl px-4 py-3.5" aria-label="등록된 작품 정보">
              <div className="flex items-start gap-1.5">
                <ul className="flex flex-1 flex-col gap-1.5">
                  <ArtworkSummaryItem label="작품명" value={state.title || '-'} />
                  <ArtworkSummaryItem label="작가명" value={state.artistName || '-'} />
                </ul>
                <ul className="flex flex-1 flex-col gap-1.5">
                  <ArtworkSummaryItem
                    label="등록자"
                    value={formatPerson(state.registrantName, state.registrantAccount)}
                  />
                  <ArtworkSummaryItem
                    label="담당자"
                    value={formatPerson(state.qnaAssigneeName, state.qnaAssigneeAccount)}
                  />
                </ul>
              </div>
            </section>
          )}
        </main>

        <CompleteButton
          onClick={() =>
            navigate(isPersonalArtworkComplete ? '/my' : `/exhibition/${displayId}/artworks`, {
              replace: true,
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      <main className="flex flex-1 flex-col overflow-y-auto px-5 pb-8">
        <CompleteHeader
          title="전시 등록이 완료되었어요"
          description={
            <>
              이제 관람자가 전시를 발견할 수 있어요.
              <br />
              설정한 공개 시점에 맞춰 노출돼요.
            </>
          }
        />

        <div className="mt-14 flex items-start gap-1.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <SummaryRow label="전시명" value={state?.title ?? '-'} />
            <SummaryRow label="소속" value={affiliation || '-'} />
            <SummaryRow label="장소" value={state?.placeName ?? '-'} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <SummaryRow
              label="전시작 공개"
              value={state?.artworkVisibility ? VISIBILITY_LABEL[state.artworkVisibility] : '-'}
            />
            <SummaryRow
              label="콘텐츠 공개"
              value={state?.contentVisibility ? VISIBILITY_LABEL[state.contentVisibility] : '-'}
            />
          </div>
        </div>

        <CompleteInfo message="등록 후에도 전시 관리에서 수정할 수 있어요." />
      </main>

      <CompleteButton onClick={() => navigate('/my', { replace: true })} />
    </div>
  );
}

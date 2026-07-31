import { Check, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { VISIBILITY_LABEL, type VisibilityType } from '@/constants/visibility';

interface CompleteState {
  title?: string;
  school?: string;
  department?: string;
  organizer?: string;
  placeName?: string;
  artworkVisibility?: VisibilityType;
  contentVisibility?: VisibilityType;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="typo-body-xs-regular shrink-0 text-faint">{label}</span>
      <span className="typo-body-xs-regular text-main">{value}</span>
    </div>
  );
}

export function ExhibitionRegisterComplete() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: CompleteState | null };

  const affiliation = [state?.school, state?.organizer ?? state?.department]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mx-auto flex h-dvh w-96 flex-col bg-page">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5">
        {/* 완료 안내 */}
        <div className="mt-40 flex flex-col items-center gap-2.5">
          <div className="flex size-20 items-center justify-center rounded-full bg-box200">
            <div className="flex size-12 items-center justify-center rounded-full bg-dark">
              <Check className="size-6 text-white" strokeWidth={2.8} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="typo-body-xl-bold text-center text-main">전시 등록이 완료되었어요</h1>
            <p className="typo-body-xs-regular text-center text-faint">
              이제 관람자가 전시를 발견할 수 있어요.
              <br />
              설정한 공개 시점에 맞춰 노출돼요.
            </p>
          </div>
        </div>

        {/* 요약 */}
        <div className="mt-14 flex items-start gap-1.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <SummaryRow label="전시명" value={state?.title ?? '-'} />
            <SummaryRow label="소속" value={affiliation || '-'} />
            <SummaryRow label="장소" value={state?.placeName ?? '-'} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <SummaryRow
              label="전시작 공개"
              value={
                state?.artworkVisibility ? VISIBILITY_LABEL[state.artworkVisibility] : '-'
              }
            />
            <SummaryRow
              label="콘텐츠 공개"
              value={
                state?.contentVisibility ? VISIBILITY_LABEL[state.contentVisibility] : '-'
              }
            />
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div className="shrink-0 px-5 pb-4">
        <div className="flex items-start gap-2 rounded-2xl bg-card p-3.5">
          <Info className="size-3.5 shrink-0 text-faint" strokeWidth={1} />
          <p className="typo-body-xs-regular text-faint">
            등록 후에도 전시 관리에서 수정할 수 있어요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my', { replace: true })}
          className="typo-body-sm-bold mt-4 h-11 w-full rounded-xl bg-dark text-white"
        >
          완료
        </button>
      </div>
    </div>
  );
}

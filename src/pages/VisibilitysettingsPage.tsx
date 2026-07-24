import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { BottomButtonBar, PageHeader } from '@/components/common';
import { RadioOption } from '@/components/visibility-settings';
import {
  formatStartDate,
  VISIBILITY_LABEL,
  type VisibilityType,
} from '@/constants/visibility';

interface VisibilityState {
  startDate?: string | Date | null;
  artworkVisibility?: VisibilityType;
}

export function VisibilitySettings() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: VisibilityState | null };

  const startDateLabel = formatStartDate(state?.startDate);

  const [selected, setSelected] = useState<VisibilityType>(state?.artworkVisibility ?? 'startDate');

  const save = () => {
    navigate('/exhibition/manage', {
      replace: true,
      state: { ...state, artworkVisibility: selected },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <PageHeader title="공개 설정" onBack={() => navigate(-1)} centered />

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-6">
        <div className="flex flex-col gap-1">
          <h2 className="typo-body-md-bold text-main">공개 시점 설정</h2>
          <p className="typo-body-xs-regular text-hint">
            공개 설정은 대표자만 변경할 수 있어요.
            <br />
            전시 작품과 콘텐츠 노출 시점을 한 곳에서 관리해요.
          </p>
        </div>

        <section className="mt-8 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="typo-body-sm-bold text-main">전시작 공개 시점</span>
            <span className="typo-body-xs-regular text-hint">등록된 전시작 전체에 일괄 적용돼요.</span>
          </div>

          <div role="radiogroup" className="flex flex-col gap-2">
            <RadioOption
              checked={selected === 'immediate'}
              onSelect={() => setSelected('immediate')}
              title={VISIBILITY_LABEL.immediate}
              description="등록 즉시 관람자에게 노출돼요."
            />
            <RadioOption
              checked={selected === 'startDate'}
              onSelect={() => setSelected('startDate')}
              title={VISIBILITY_LABEL.startDate}
              description={
                startDateLabel ? `${startDateLabel} 부터 노출돼요.` : '전시 시작일부터 노출돼요.'
              }
            />
            <RadioOption
              checked={selected === 'hidden'}
              onSelect={() => setSelected('hidden')}
              title={VISIBILITY_LABEL.hidden}
              description="관람자에게 노출되지 않아요."
            />
          </div>
        </section>
      </div>

      <BottomButtonBar withBorder={false}>
        <button
          type="button"
          onClick={save}
          className="typo-body-sm-bold h-11 w-full rounded-lg bg-dark text-white"
        >
          저장하기
        </button>
      </BottomButtonBar>
    </div>
  );
}

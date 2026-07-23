import { useEffect, useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useHeaderContext } from '@/components/layout/headerContext';
import {
  formatStartDate,
  VISIBILITY_LABEL,
  type VisibilityType,
} from '@/constants/visibility';

interface RadioOptionProps {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}

function RadioOption({ checked, onSelect, title, description }: RadioOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full items-start gap-2 rounded-2xl bg-card px-4 py-3.5 text-left outline outline-1 outline-offset-[-1px] outline-line-soft"
    >
      <span
        className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
          checked
            ? 'outline outline-2 outline-offset-[-2px] outline-main'
            : 'border-2 border-line'
        }`}
      >
        {checked && <span className="size-1.5 rounded-full bg-main" />}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="typo-body-sm-semibold text-main">{title}</span>
        <span className="typo-body-xs-regular text-faint">{description}</span>
      </span>
    </button>
  );
}

interface VisibilityState {
  startDate?: string | Date | null;
  artworkVisibility?: VisibilityType;
}

export function VisibilitySettings() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: VisibilityState | null };
  const { setHeader, resetHeader } = useHeaderContext();

  const startDateLabel = formatStartDate(state?.startDate);

  const [selected, setSelected] = useState<VisibilityType>(
    state?.artworkVisibility ?? 'startDate',
  );

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    // 뒤로 돌아가면서 선택값을 전시관리 화면에 전달한다
    navigate('/exhibition/manage', {
      replace: true,
      state: { ...state, artworkVisibility: selected },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-14.5 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <div className="typo-body-xl-bold text-center text-main">공개 설정</div>
        <div className="size-7" />
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-6">
        {/* 상단 안내 */}
        <div className="flex flex-col gap-1">
          <h2 className="typo-body-md-bold text-main">공개 시점 설정</h2>
          <p className="typo-body-xs-regular text-hint">
            공개 설정은 대표자만 변경할 수 있어요.
            <br />
            전시 작품과 콘텐츠 노출 시점을 한 곳에서 관리해요.
          </p>
        </div>

        {/* 전시작 공개 시점 */}
        <section className="mt-8 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="typo-body-sm-bold text-main">전시작 공개 시점</span>
            <span className="typo-body-xs-regular text-hint">
              등록된 전시작 전체에 일괄 적용돼요.
            </span>
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
                startDateLabel
                  ? `${startDateLabel} 부터 노출돼요.`
                  : '전시 시작일부터 노출돼요.'
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

      <div className="px-5 pb-8 pt-4">
        <button
          type="button"
          onClick={save}
          className="typo-body-sm-bold h-11 w-full rounded-lg bg-dark text-white"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

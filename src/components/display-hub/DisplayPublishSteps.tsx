import StepDoneIcon from '@/assets/display-hub/StepDoneIcon.svg';
import { cn } from '@/utils/cn';

const STEPS = ['준비하기', '등록 요청', '승인 후 공개'] as const;
const ALIGN = ['items-start', 'items-center', 'items-end'] as const;

/** 전시 공개까지의 3단계. current 는 지금 진행 중인 단계(1부터) */
export function DisplayPublishSteps({ current }: { current: 2 | 3 }) {
  return (
    <ol aria-label="진행 단계" className="relative grid grid-cols-3">
      <li aria-hidden="true" className="absolute inset-x-3 top-2.75 border-t-2 border-primary" />
      <li
        aria-hidden="true"
        className={cn(
          'absolute left-3 top-2.75 h-0.5 bg-interactive-primary',
          current === 3 ? 'right-3' : 'right-1/2',
        )}
      />
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isDone = step < current;
        const isCurrent = step === current;

        return (
          <li
            key={label}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn('relative flex flex-col gap-2', ALIGN[index])}
          >
            {isDone ? (
              <img src={StepDoneIcon} alt="" />
            ) : isCurrent ? (
              <span className="size-6 rounded-circle border-6 border-interactive-primary bg-primary-white" />
            ) : (
              <span className="typography-body-md-semibold flex size-6 items-center justify-center rounded-circle bg-secondary text-tertiary">
                {step}
              </span>
            )}
            <span
              className={cn(
                isCurrent
                  ? 'typography-body-md-semibold text-primary'
                  : 'typography-body-md-medium',
                isDone && 'text-secondary',
                !isDone && !isCurrent && 'text-tertiary',
              )}
            >
              {label}
              {isDone && <span className="sr-only"> 완료</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

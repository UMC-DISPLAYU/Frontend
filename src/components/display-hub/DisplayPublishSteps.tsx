import { cn } from '@/utils/cn';

import { DisplayHubIcon } from './DisplayHubIcon';

const STEPS = ['준비하기', '등록 요청', '승인 후 공개'] as const;
const ALIGN = ['justify-items-start', 'justify-items-center', 'justify-items-end'] as const;

/** 전시 공개까지의 3단계. current 는 지금 진행 중인 단계(1부터). 값은 프로토타입 flow.css `.steps`와 같다 */
export function DisplayPublishSteps({ current }: { current: 2 | 3 }) {
  return (
    <ol
      aria-label="진행 단계"
      className={cn(
        'relative grid grid-cols-3',
        "before:absolute before:inset-x-3 before:top-[11px] before:h-0.5 before:rounded-[2px] before:bg-[#d4d4d8] before:content-['']",
        "after:absolute after:top-[11px] after:left-3 after:h-0.5 after:rounded-[2px] after:bg-interactive-primary after:transition-[width] after:duration-[600ms] after:ease-standard after:content-['']",
        current === 3 ? 'after:w-[calc(100%-24px)]' : 'after:w-[calc((100%-24px)/2)]',
      )}
    >
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isDone = step < current;
        const isCurrent = step === current;

        return (
          <li
            key={label}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'relative z-1 grid gap-1.5',
              ALIGN[index],
              isCurrent ? 'typography-body-md-semibold text-primary' : 'typography-body-md-medium',
              isDone && 'text-secondary',
              !isDone && !isCurrent && 'text-tertiary',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid size-6 place-items-center rounded-circle',
                isDone || isCurrent
                  ? 'bg-interactive-primary text-interactive-inverse'
                  : 'typography-body-md-semibold bg-secondary text-tertiary',
              )}
            >
              {isDone ? (
                <DisplayHubIcon name="check" strokeWidth={2.6} className="size-3.5" />
              ) : isCurrent ? (
                <span className="size-2.5 rounded-circle bg-primary-white" />
              ) : (
                step
              )}
            </span>
            <span>
              {label}
              {isDone && <span className="sr-only"> 완료</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

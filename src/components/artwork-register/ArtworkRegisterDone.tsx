import { useEffect, useRef } from 'react';

import { PageContainer } from '@/components/layout';
import { cn } from '@/utils/cn';

import { BIG_BUTTON_CLASS } from './artworkRegister.styles';
import { ArtworkRegisterCta } from './ArtworkRegisterCta';
import { CheckIcon } from './ArtworkRegisterIcons';

/* 프로토타입 완료 모션: 링 → 체크 → 제목 · 설명 → 요약 → 버튼 순서로 한 번만 위로 12px 떠오른다 */
const RISE_CLASS =
  'transition-[opacity,translate] ease-standard starting:translate-y-3 starting:opacity-0';

interface ArtworkRegisterDoneProps {
  description: string;
  summary: { label: string; value: string }[];
  onConfirm: () => void;
}

export function ArtworkRegisterDone({ description, summary, onConfirm }: ArtworkRegisterDoneProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <PageContainer variant="form" className="bg-primary-white text-primary">
      <section aria-label="작품 등록이 완료되었어요" className="flex flex-1 flex-col">
        <div className="pt-14 text-center">
          <div
            aria-hidden="true"
            className="relative isolate mx-auto grid size-16 place-items-center rounded-circle bg-[#18181b] text-base-white transition-[opacity,scale] duration-[600ms] ease-standard starting:scale-72 starting:opacity-0"
          >
            <span className="absolute inset-0 -z-1 scale-175 rounded-circle bg-[#18181b] opacity-0 transition-[opacity,scale] delay-[180ms] duration-[900ms] ease-standard starting:scale-100 starting:opacity-22" />
            <CheckIcon
              strokeWidth={2.4}
              className="size-7 [stroke-dasharray:28] [stroke-dashoffset:0] transition-[stroke-dashoffset] delay-300 duration-[450ms] ease-standard starting:[stroke-dashoffset:28]"
            />
          </div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              RISE_CLASS,
              'typography-title-xs mt-5 outline-none delay-300 duration-500',
            )}
          >
            작품 등록이 완료되었어요
          </h1>
          <p
            className={cn(
              RISE_CLASS,
              'typography-body-lg-regular mt-2 text-secondary delay-[360ms] duration-500',
            )}
          >
            {description}
          </p>
        </div>

        <dl
          className={cn(
            RISE_CLASS,
            'mt-8 grid gap-5 rounded-12 bg-secondary px-5 py-6 delay-[440ms] duration-[550ms]',
          )}
        >
          {summary.map(({ label, value }) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <dt className="typography-body-lg-medium shrink-0 text-secondary">{label}</dt>
              <dd className="typography-body-lg-semibold min-w-0 text-right break-keep">{value}</dd>
            </div>
          ))}
        </dl>

        <ArtworkRegisterCta className={cn(RISE_CLASS, 'delay-[620ms] duration-500')}>
          <button type="button" onClick={onConfirm} className={BIG_BUTTON_CLASS}>
            확인
          </button>
        </ArtworkRegisterCta>
      </section>
    </PageContainer>
  );
}

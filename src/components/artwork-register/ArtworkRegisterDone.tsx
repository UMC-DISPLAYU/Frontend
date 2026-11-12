import { useEffect, useRef } from 'react';

import CompleteIcon from '@/assets/display-hub/CompleteIcon.svg';
import { BottomFixedBar } from '@/components/common';
import { PageContainer } from '@/components/layout';

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
      <main className="flex flex-col gap-10 pt-14 pb-5">
        <div className="flex flex-col items-center gap-5 text-center">
          <img src={CompleteIcon} alt="" />
          <div className="flex flex-col gap-2">
            <h1 ref={headingRef} tabIndex={-1} className="typography-title-xs outline-none">
              작품 등록이 완료되었어요
            </h1>
            <p className="typography-body-lg-regular break-keep text-secondary">{description}</p>
          </div>
        </div>

        <dl className="flex flex-col gap-5 rounded-12 bg-secondary px-5 py-6">
          {summary.map(({ label, value }) => (
            <div key={label} className="flex items-baseline gap-4">
              <dt className="typography-body-lg-regular shrink-0 text-secondary">{label}</dt>
              <dd className="typography-body-lg-semibold min-w-0 flex-1 text-right break-keep">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </main>

      <BottomFixedBar container="form">
        <button
          type="button"
          onClick={onConfirm}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          확인
        </button>
      </BottomFixedBar>
    </PageContainer>
  );
}

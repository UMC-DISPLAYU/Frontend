import { Link, useParams } from 'react-router-dom';

import CompleteIcon from '@/assets/display-hub/CompleteIcon.svg';
import StepDoneIcon from '@/assets/display-hub/StepDoneIcon.svg';
import { BottomFixedBar } from '@/components/common';
import { PageContainer } from '@/components/layout';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';

export function DisplayHubRequestedPage() {
  const { displayId } = useParams();
  const { data: display } = useDisplayDetail(Number(displayId));

  const rows = [
    { label: '전시명', value: display?.title ?? '' },
    { label: '상태', value: '심사 중' },
    { label: '공개 방식', value: '승인된 시점부터 자동 공개' },
  ];

  return (
    <PageContainer variant="form" className="bg-primary-white text-primary">
      <main className="flex flex-col gap-10 pt-14 pb-5">
        <div className="flex flex-col items-center gap-5 text-center">
          <img src={CompleteIcon} alt="" />
          <div className="flex flex-col gap-2">
            <h1 className="typography-title-xs">등록을 요청했어요</h1>
            <p className="typography-body-lg-regular whitespace-pre-line text-secondary">
              {'승인된 시점부터 관람객에게 자동으로 공개돼요\n심사 중에도 내용을 수정할 수 있어요'}
            </p>
          </div>
        </div>

        <ol className="relative grid grid-cols-3">
          <li
            aria-hidden="true"
            className="absolute inset-x-3 top-2.75 h-0.5 bg-interactive-primary"
          />
          <li className="relative flex flex-col items-start gap-2">
            <img src={StepDoneIcon} alt="" />
            <span className="typography-body-md-medium text-secondary">준비하기</span>
          </li>
          <li className="relative flex flex-col items-center gap-2">
            <img src={StepDoneIcon} alt="" />
            <span className="typography-body-md-medium text-secondary">등록 요청</span>
          </li>
          <li aria-current="step" className="relative flex flex-col items-end gap-2">
            <span className="size-6 rounded-circle border-6 border-interactive-primary bg-primary-white" />
            <span className="typography-body-md-semibold text-primary">승인 후 공개</span>
          </li>
        </ol>

        <div className="flex flex-col gap-3">
          <dl className="flex flex-col gap-5 rounded-12 bg-secondary px-5 py-6">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline gap-4">
                <dt className="typography-body-lg-regular shrink-0 text-secondary">{row.label}</dt>
                <dd className="typography-body-lg-semibold min-w-0 flex-1 text-right text-primary">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="typography-body-md-medium text-center text-tertiary">
            승인 결과는 알림으로 알려드릴 예정이에요
          </p>
        </div>
      </main>

      <BottomFixedBar container="form">
        <Link
          to="/display-management"
          replace
          className="typography-body-lg-semibold flex h-11 w-full items-center justify-center rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          내 전시 관리로 이동
        </Link>
      </BottomFixedBar>
    </PageContainer>
  );
}

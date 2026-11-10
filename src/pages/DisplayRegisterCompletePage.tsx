import { Link, useParams } from 'react-router-dom';

import CompleteIcon from '@/assets/display-hub/CompleteIcon.svg';
import ChevronIcon from '@/assets/display-register/ChevronIcon.svg';
import { BottomFixedBar } from '@/components/common';
import { DisplayPublishSteps } from '@/components/display-hub';
import { PageContainer } from '@/components/layout';

export function DisplayRegisterCompletePage() {
  const { displayId } = useParams();
  const basePath = `/exhibition/${displayId}`;

  const nextSteps = [
    {
      to: `${basePath}/work`,
      title: '작품 올리기',
      description: '전시 작업에서 작품과 콘텐츠를 올려요',
    },
    {
      to: `${basePath}/team`,
      title: '팀원 초대하기',
      description: '닉네임이나 초대 링크로 초대해요',
    },
    {
      to: `${basePath}/manage`,
      title: '공개 시점 정하기',
      description: '작품과 콘텐츠가 공개되는 때를 정해요',
    },
  ];

  return (
    <PageContainer variant="form" className="bg-primary-white text-primary">
      <main className="flex flex-col gap-10 pt-14 pb-5">
        <div className="flex flex-col items-center gap-5 text-center">
          <img src={CompleteIcon} alt="" />
          <div className="flex flex-col gap-2">
            <h1 className="typography-title-xs">전시 관리가 생성되었어요</h1>
            <p className="typography-body-lg-regular break-keep text-secondary">
              아직 공개되지 않았어요 준비를 마치면 등록을 요청할 수 있어요
            </p>
          </div>
        </div>

        <DisplayPublishSteps current={2} />

        <section aria-labelledby="display-next-steps" className="flex flex-col gap-3">
          <h2 id="display-next-steps" className="typography-body-xl-semibold">
            전시 이어 준비하기
          </h2>
          <ul className="overflow-hidden rounded-12 border border-primary bg-primary-white px-4">
            {nextSteps.map((step) => (
              <li key={step.to} className="border-b border-primary last:border-b-0">
                <Link
                  to={step.to}
                  className="group -mx-4 flex items-center gap-3 px-4 py-4 transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="typography-body-lg-semibold">{step.title}</span>
                    <span className="typography-body-md-medium text-secondary">
                      {step.description}
                    </span>
                  </span>
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <img
                      src={ChevronIcon}
                      alt=""
                      className="transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
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

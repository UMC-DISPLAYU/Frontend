import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  BIG_LINK_CLASS,
  CheckIcon,
  ChevronRightIcon,
  DisplayRegisterCta,
  FOCUS_CLASS,
} from '@/components/display-register';
import { PageContainer } from '@/components/layout';
import { cn } from '@/utils/cn';

const DISPLAY_MANAGEMENT_PATH = '/display-management';
const STEPS = ['준비하기', '등록 요청', '승인 후 공개'] as const;
/* 프로토타입 완료 모션: 링 → 체크 → 제목 · 설명 → 단계 → 버튼 순서로 한 번만 위로 12px 떠오른다 */
const RISE_CLASS =
  'transition-[opacity,translate] ease-standard starting:translate-y-3 starting:opacity-0';

/** 프로토타입 stepper(1): 준비하기 완료 · 등록 요청 현재 · 승인 후 공개 다음 */
function PublishSteps() {
  return (
    <ol
      aria-label="진행 단계"
      className={cn(RISE_CLASS, 'relative mt-8 grid grid-cols-3 delay-[440ms] duration-[550ms]')}
    >
      <li
        aria-hidden="true"
        className="absolute inset-x-3 top-[11px] h-0.5 rounded-2 bg-[#d4d4d8]"
      />
      <li
        aria-hidden="true"
        className="absolute top-[11px] left-3 h-0.5 w-[calc((100%-24px)*0.5)] rounded-2 bg-[#18181b]"
      />
      {STEPS.map((label, index) => {
        const state = index === 0 ? 'done' : index === 1 ? 'current' : 'next';

        return (
          <li
            key={label}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn(
              'typography-body-md-medium relative z-1 grid justify-items-center gap-1.5 text-tertiary',
              index === 0 && 'justify-items-start',
              index === STEPS.length - 1 && 'justify-items-end',
              state === 'current' && 'font-semibold text-primary',
              state === 'done' && 'text-secondary',
            )}
          >
            <span
              className={cn(
                'typography-body-md-semibold grid size-6 place-items-center rounded-circle',
                state === 'next' ? 'bg-[#f4f4f5] text-tertiary' : 'bg-[#18181b] text-base-white',
              )}
            >
              {state === 'done' && <CheckIcon strokeWidth={2.6} className="size-3.5" />}
              {state === 'current' && <span className="size-2.5 rounded-circle bg-primary-white" />}
              {state === 'next' && index + 1}
            </span>
            <span>
              {label}
              {state === 'done' && <span className="sr-only"> 완료</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function DisplayRegisterCompletePage() {
  const navigate = useNavigate();
  const { displayId } = useParams();
  const basePath = `/exhibition/${displayId}`;

  const { state } = useLocation();
  // 내 전시 관리에서 등록을 시작했으면 바로 뒤 기록이 내 전시 관리다. 그때는 새로 쌓지 않고 돌아가야 뒤로가기에 같은 화면이 두 번 나오지 않는다
  const isPrevDisplayManagement =
    (state as { prevPath?: string } | null)?.prevPath === DISPLAY_MANAGEMENT_PATH;

  const goDisplayManagement = () => {
    if (isPrevDisplayManagement) navigate(-1);
    else navigate(DISPLAY_MANAGEMENT_PATH, { replace: true });
  };

  // 팀원 화면의 뒤로가기(<)가 내 전시 관리로 가도록, 완료 화면 기록을 내 전시 관리로 바꾼 뒤 팀원 화면을 쌓는다
  const goTeam = async () => {
    if (isPrevDisplayManagement) await navigate(-1);
    else await navigate(DISPLAY_MANAGEMENT_PATH, { replace: true });
    navigate(`${basePath}/team`);
  };

  const nextSteps = [
    {
      to: `${basePath}/work`,
      title: '작품 올리기',
      description: '전시 작업에서 작품과 콘텐츠를 올려요',
    },
    { onClick: goTeam, title: '팀원 초대하기', description: '닉네임이나 초대 링크로 초대해요' },
    {
      to: `${basePath}/manage`,
      title: '공개 시점 정하기',
      description: '작품과 콘텐츠가 공개되는 때를 정해요',
    },
  ];
  const itemClass = cn(
    'group flex w-full items-center justify-between gap-3 py-4 text-left',
    FOCUS_CLASS,
  );

  return (
    // 프로토타입은 태블릿 · 데스크톱에서도 입력 칸 바깥까지 흰 화면이다
    <div className="min-h-dvh bg-primary-white">
      <PageContainer variant="form" className="bg-primary-white text-primary">
        <main aria-label="전시 관리가 생성되었어요" className="flex flex-1 flex-col">
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
            <h1 className={cn(RISE_CLASS, 'typography-title-xs mt-5 delay-300 duration-500')}>
              전시 관리가 생성되었어요
            </h1>
            <p
              className={cn(
                RISE_CLASS,
                'typography-body-lg-regular mt-2 text-secondary delay-[360ms] duration-500',
              )}
            >
              아직 공개되지 않았어요
              <br />
              준비를 마치면 등록을 요청할 수 있어요
            </p>
          </div>

          <PublishSteps />

          <h2 className="typography-body-xl-semibold mt-9">전시 이어 준비하기</h2>
          <ul className="mt-3 rounded-12 border border-primary px-4">
            {nextSteps.map((step) => {
              const content = (
                <>
                  <span className="min-w-0">
                    <b className="typography-body-lg-semibold block text-secondary">{step.title}</b>
                    <span className="typography-body-md-medium mt-0.5 block text-secondary">
                      {step.description}
                    </span>
                  </span>
                  <ChevronRightIcon className="size-4.5 shrink-0 text-primary transition-transform duration-base ease-standard group-hover:translate-x-[3px]" />
                </>
              );

              return (
                <li key={step.title} className="border-t border-bg-tertiary first:border-t-0">
                  {step.to ? (
                    <Link to={step.to} className={itemClass}>
                      {content}
                    </Link>
                  ) : (
                    <button type="button" onClick={step.onClick} className={itemClass}>
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex-1" />
          <DisplayRegisterCta className={cn(RISE_CLASS, 'delay-[620ms] duration-500')}>
            <Link
              to={DISPLAY_MANAGEMENT_PATH}
              replace
              onClick={(event) => {
                event.preventDefault();
                goDisplayManagement();
              }}
              className={BIG_LINK_CLASS}
            >
              내 전시 관리로 이동
            </Link>
          </DisplayRegisterCta>
        </main>
      </PageContainer>
    </div>
  );
}

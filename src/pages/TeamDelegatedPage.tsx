import { useEffect, useRef } from 'react';

import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import CompleteIcon from '@/assets/display-hub/CompleteIcon.svg';
import SwapArrowIcon from '@/assets/team-manage/SwapArrowIcon.svg';
import { WorkHeader } from '@/components/exhibition-work';
import { PageContainer } from '@/components/layout';
import {
  MemberAvatar,
  RoleBadge,
  type TeamDelegatedState,
  type TeamRole,
} from '@/components/team-manage';

const isDelegatedState = (state: unknown): state is TeamDelegatedState =>
  typeof state === 'object' &&
  state !== null &&
  typeof (state as TeamDelegatedState).newLeaderName === 'string' &&
  typeof (state as TeamDelegatedState).myName === 'string';

export function TeamDelegatedPage() {
  const { displayId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const workPath = `/exhibition/${displayId}/work`;
  const state = isDelegatedState(location.state) ? location.state : null;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // 위임 직후에만 들어오는 화면이라, 주소로 바로 열면 전시 작업으로 보낸다
  if (!state) return <Navigate to={workPath} replace />;

  return (
    <PageContainer variant="form" className="bg-primary-white text-primary">
      {/* 위임 뒤에는 대표자 전용인 전시 관리 · 팀원 관리로 돌아갈 수 없어 전시 작업으로 간다(프로토타입) */}
      <WorkHeader title="팀원 관리" onBack={() => navigate(workPath, { replace: true })} />
      <section aria-live="polite" className="flex flex-col items-center pt-18.5 pb-7 text-center">
        <img src={CompleteIcon} alt="" className="mb-4" />
        <h2 ref={headingRef} tabIndex={-1} className="typography-title-xs outline-none">
          대표자를 위임했어요
        </h2>
        <h3 className="typography-title-xs mt-7">이제 관리자로 참여해요</h3>
        <p className="typography-body-md-medium w-full pt-3 pb-7.5 whitespace-pre-line text-tertiary">
          {`${state.newLeaderName}님이 새로운 대표자가 되었어요\n대표자 전용 전시 관리 접근은 종료됐어요`}
        </p>
        <div className="flex w-full items-center">
          <DelegatedMember name={state.newLeaderName} role="owner" />
          <span aria-hidden="true" className="flex h-5 w-5.5 shrink-0 items-center justify-center">
            <img src={SwapArrowIcon} alt="" />
          </span>
          <DelegatedMember name={state.myName} role="manager" />
        </div>
        <Link
          to={workPath}
          replace
          className="typography-body-lg-semibold mt-10.5 flex h-12.5 w-full items-center justify-center rounded-12 bg-primary-black px-3.5 text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          전시 작업으로 이동
        </Link>
        <p className="typography-body-md-medium w-full pt-2.5 text-tertiary">
          관리자 권한으로 전시 작업을 이어갈 수 있어요
        </p>
      </section>
    </PageContainer>
  );
}

function DelegatedMember({ name, role }: { name: string; role: TeamRole }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <MemberAvatar tone={role} />
      <span className="typography-body-md-semibold w-full max-w-30 truncate">{name}</span>
      <RoleBadge role={role} />
    </div>
  );
}

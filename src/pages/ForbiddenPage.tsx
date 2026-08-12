import { useNavigate } from 'react-router-dom';

import LockIcon from '@/assets/common/LockIcon.svg';
import { BottomButton } from '@/components/common';
import { useGoBackOrHome } from '@/hooks/useGoBackOrHome';

export function ForbiddenPage() {
  const navigate = useNavigate();
  const goBackOrHome = useGoBackOrHome();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      <main className="flex min-h-0 flex-1 flex-col px-5 pt-11 text-center">
        <section className="flex flex-1 flex-col items-center justify-center">
          <img src={LockIcon} alt="" aria-hidden="true" className="mb-4 size-9" />
          <p className="typo-heading-xl text-[64px] leading-[56px] text-logo">403</p>
          <h1 className="mt-4 typo-body-xl-bold text-neutral-900">접근할 수 없는 페이지예요</h1>
          <p className="mt-2 typo-body-xs-regular text-neutral-500">
            해당 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <button
            type="button"
            className="mt-5 typo-body-sm-regular text-neutral-400 underline underline-offset-2"
            onClick={goBackOrHome}
          >
            이전 페이지로 돌아가기
          </button>
        </section>
      </main>

      <BottomButton type="button" onClick={() => navigate('/home', { replace: true })}>
        홈으로 이동
      </BottomButton>
    </div>
  );
}

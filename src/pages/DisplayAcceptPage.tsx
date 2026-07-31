import { useLocation, useNavigate } from 'react-router-dom';

import type { Invitation } from '@/types/invitation';

type InfoRow = { label: string; value: string };

function buildExhibitionInfo(invitation?: Invitation): InfoRow[] {
  return [
    { label: '전시명', value: invitation?.title ?? '-' },
    { label: '소속', value: invitation?.department ?? '-' },
    { label: '기간', value: invitation?.period ?? '-' },
    { label: '역할', value: '팀원' },
  ];
}

const VERIFIED_CHECKLIST = ['전시 콘텐츠 추가', '전시작 등록', 'Q&A 담당자 지정 가능'];

export function DisplayAcceptPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { invitation?: Invitation; isVerified?: boolean } | null;
  const invitation = state?.invitation;
  const isVerified = state?.isVerified ?? false;

  const exhibitionInfo = buildExhibitionInfo(invitation);

  const handleComplete = () => {
    // TODO: 완료 후 이동 경로 연결 (예: 전시 콘텐츠 추가 화면)
    navigate('/my/exhibitions');
  };

  const handleGoManage = () => {
    navigate('/display/manage');
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-16">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-14 items-center justify-center rounded-full bg-[var(--palette-green-50)] text-[var(--palette-green-500)]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9.3 14.4L12.4 17.4L18.7 10.8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="typo-body-xl-bold text-center text-main">전시 참여가 완료되었어요</h1>
            <p className="typo-body-xs-regular text-center text-faint">
              이제 이 전시가 내 전시 관리에 추가돼요.
            </p>
          </div>
        </div>

        <section className="mt-10 flex flex-col gap-5">
          <dl className="flex flex-col gap-1.5 rounded-2xl bg-card px-4 py-3.5">
            {exhibitionInfo.map((row) => (
              <div key={row.label} className="flex items-start gap-5">
                <dt className="typo-body-xs-regular w-10 shrink-0 text-faint">{row.label}</dt>
                <dd className="typo-body-xs-regular text-main">{row.value}</dd>
              </div>
            ))}
          </dl>

          {isVerified ? (
            <ul className="flex flex-col gap-1">
              {VERIFIED_CHECKLIST.map((label) => (
                <li key={label} className="flex items-center gap-2 text-hint">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                    <path
                      d="M3.9 6.1L5.4 7.6L8.1 4.7"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="typo-body-xs-regular text-hint">{label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="typo-body-xs-regular text-center text-sub600">
                전시작 등록은 학교 이메일 인증 후 가능해요.
              </p>
              <div className="flex gap-2 rounded-xl bg-box100 px-4 py-4">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-faint"
                >
                  <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
                  <path
                    d="M8 7.2V11"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="5" r="0.85" fill="currentColor" />
                </svg>
                <p className="typo-body-xs-regular text-hint">
                  인증 전에도 전시 콘텐츠는 추가할 수 있어요. 작품을 등록하려면 학교 이메일 인증이
                  필요해요.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8 pt-4">
        <button
          type="button"
          onClick={handleGoManage}
          className="typo-body-sm-semibold w-full rounded-xl border border-line-soft bg-card py-3.5 text-main"
        >
          내 전시 관리로 이동
        </button>
      </div>
    </div>
  );
}

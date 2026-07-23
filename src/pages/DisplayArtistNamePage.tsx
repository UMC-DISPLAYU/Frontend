import { useState } from 'react';

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

export function DisplayArtistNamePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const invitation = (location.state as { invitation?: Invitation } | null)?.invitation;
  const exhibitionInfo = buildExhibitionInfo(invitation);

  const [artistName, setArtistName] = useState('');
  const isValid = artistName.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    // TODO: 참여 완료 API 호출 (invitation?.id 와 artistName 전송)
    // TODO: 작가(학교 이메일) 인증 여부를 실제 유저 상태/응답에서 가져오기
    const isVerified = false; // 임시값: 인증되면 true → 완료 화면이 인증 상태로 표시됨

    navigate(`/invitations/${invitation?.id ?? ''}/complete`, {
      state: { invitation, artistName: artistName.trim(), isVerified },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6">
        <section className="flex flex-col gap-1.5">
          <h2 className="typo-body-md-bold text-main">
            이 전시에서 사용할 작가명을 입력해주세요
          </h2>
          <p className="typo-body-xs-regular text-hint">
            대표자와 팀원이 서로를 쉽게 확인하고, 작품 등록 시 기본 작가명으로 사용할
            이름이에요.
          </p>
        </section>

        <dl className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-card px-5 py-5">
          {exhibitionInfo.map((row) => (
            <div key={row.label} className="flex items-start gap-5">
              <dt className="typo-body-sm-regular w-12 shrink-0 text-hint">{row.label}</dt>
              <dd className="typo-body-sm-semibold text-main">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-col gap-2">
          <label htmlFor="artist-name" className="typo-body-md-semibold text-main">
            전시 작가명 <span className="text-error">*</span>
          </label>
          <input
            id="artist-name"
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="예: 고상준"
            className="typo-body-md-regular w-full rounded-xl border border-line-soft bg-card px-4 py-3.5 text-main placeholder:text-faint focus:border-line-active focus:outline-none"
          />
          <p className="typo-body-xs-regular text-hint">
            실명 또는 이 전시에서 사용할 작가명을 입력해주세요.
          </p>
        </div>

        <div className="mt-5 flex gap-2 rounded-xl bg-box100 px-4 py-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-faint"
          >
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 7.2V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="5" r="0.85" fill="currentColor" />
          </svg>
          <p className="typo-body-xs-regular text-hint">
            입력한 작가명은 전시 팀원 목록, 전시작 등록자 표시, Q&A 담당자 지정에 사용되어
            실명 사용을 권장해요. 작품 등록 시 해당 작가명으로 입력돼요.
          </p>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`typo-body-md-semibold w-full rounded-xl py-4 transition-colors ${
            isValid ? 'bg-bt-black text-white' : 'bg-bt-gray text-faint'
          }`}
        >
          참여 완료하기
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';

import { ChevronLeft, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-5">
      <span className="typo-body-xs-regular w-10 shrink-0 text-faint">{label}</span>
      <span className="typo-body-xs-regular text-main">{value}</span>
    </div>
  );
}

export function ArtistNameSetup() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [artistName, setArtistName] = useState('');

  const info = {
    title: state?.title || '빛의 결 | 조용한 흐름',
    org: state?.org || state?.school || '중앙대학교 OO동아리',
    period: state?.period || '2025.06.10 – 2025.06.20',
    role: state?.role || '팀원',
  };

  const goCreate = () => {
    navigate('/exhibition/manage', { state: { ...state, artistName } });
  };

  return (
    <div className="mx-auto flex h-dvh w-96 flex-col bg-page">
      <header className="flex shrink-0 items-center gap-3 px-5 pt-6 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">전시 작가명 설정</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3">
        <div className="flex flex-col gap-5">
          {/* 안내 문구 */}
          <div className="flex flex-col gap-1">
            <h2 className="typo-body-md-bold text-main">
              이 전시에서 사용할 작가명을 입력해주세요
            </h2>
            <p className="typo-body-xs-regular text-sub600">
              대표자와 팀원이 서로를 쉽게 확인하고, 작품 등록 시 기본 작가명으로 사용할 이름이에요.
            </p>
          </div>

          {/* 전시 정보 요약 */}
          <div className="flex flex-col gap-1.5 rounded-2xl bg-card px-4 py-3.5">
            <SummaryRow label="전시명" value={info.title} />
            <SummaryRow label="소속" value={info.org} />
            <SummaryRow label="기간" value={info.period} />
            <SummaryRow label="역할" value={info.role} />
          </div>

          {/* 작가명 입력 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1">
                <span className="typo-body-sm-bold text-main">전시 작가명</span>
                <span className="typo-body-xs-regular text-error">*</span>
              </div>
              <div className="border-b border-input-border px-3 py-2.5">
                <input
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="홍길동"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                />
              </div>
            </div>
            <p className="typo-body-xxs-regular text-faint">
              실명 또는 이 전시에서 사용할 작가명을 입력해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 고정 영역 */}
      <div className="shrink-0 px-5 pt-4 pb-6">
        <div className="flex items-start gap-2 rounded-2xl bg-card p-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1} />
          <p className="typo-body-xs-regular text-faint">
            입력한 작가명은 팀원 목록, 전시작 등록자 표시, Q&amp;A 담당자 지정에 사용돼요. 작품 등록
            시 기본 작가명으로 자동 입력되며, 공동작업이나 팀명 표기가 필요한 경우 작품별로 수정할
            수 있어요.
          </p>
        </div>

        <button
          type="button"
          disabled={!artistName.trim()}
          onClick={goCreate}
          className="typo-body-sm-bold mt-4 h-11 w-full rounded-xl bg-dark text-white disabled:opacity-40"
        >
          전시 관리 페이지 만들기
        </button>
      </div>
    </div>
  );
}

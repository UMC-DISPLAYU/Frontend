import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

import { useHeaderContext } from '@/components/layout/headerContext';
import { VISIBILITY_LABEL, type VisibilityType } from './VisibilitysettingsPage';

interface StatPillProps {
  label: string;
  value: string;
}

function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="flex h-11 flex-1 items-center justify-between rounded-xl bg-box200 px-3">
      <span className="typo-body-sm-regular text-main">{label}</span>
      <span className="typo-body-sm-bold text-main">{value}</span>
    </div>
  );
}

interface OutlineButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  weight?: 'bold' | 'semibold';
}

function OutlineButton({ children, onClick, weight = 'bold' }: OutlineButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-faint typo-body-sm-${weight} text-main`}
    >
      {children}
    </button>
  );
}

export function ExhibitionManage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setHeader, resetHeader } = useHeaderContext();

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exhibition = {
    title: state?.placeName || '형태의 침묵',
    org: '중앙대학교 디자인학부',
    dates: state?.period || '05.28 - 06.05',
    place: state?.address || '중앙대학교 310관 갤러리',
  };

  const artworkVisibility: VisibilityType = state?.artworkVisibility ?? 'startDate';

const goVisibility = () => {
  navigate('/exhibition/visibility', {
    state: { ...state, artworkVisibility },
  });
};

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-14.5 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">전시관리</h1>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3">
        <div className="flex flex-col gap-8">
        {/* 전시 포스터 카드 */}
        <div className="flex gap-3 rounded-2xl bg-page px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_1px_1px_4px_0px_rgba(1,8,21,0.2),inset_-2px_-2px_2px_0px_rgba(255,255,255,0.9)]">
          <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-box">
            <img
              src="https://placehold.co/130x162"
              alt="전시 포스터"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <h2 className="typo-body-md-bold text-main">{exhibition.title}</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="typo-body-xs-regular text-sub700">{exhibition.org}</span>
                <span className="typo-body-xs-regular text-hint">{exhibition.dates}</span>
              </div>
              <span className="typo-body-xxs-regular text-faint">{exhibition.place}</span>
            </div>
          </div>
        </div>

        {/* 전시 등록 */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="typo-body-sm-bold text-main">전시 등록을 준비 중이에요</span>
            <span className="typo-body-xs-regular text-hint">
              팀원과 함께 전시와 작품을 함께 준비해보세요.
            </span>
          </div>
          <div className="flex gap-3">
            <StatPill label="전시" value="3" />
            <StatPill label="작품" value="2" />
          </div>
          <OutlineButton onClick={() => navigate('/display/manage')}>전시 작업으로 이동</OutlineButton>
        </section>

        {/* 팀원관리 */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="typo-body-sm-bold text-main">팀원관리</span>
            <span className="typo-body-xs-regular text-hint">
              닉네임 또는 초대 링크로 팀원을 초대할 수 있어요.
            </span>
          </div>
          <div className="flex gap-3">
            <StatPill label="참여팀원" value="2" />
            <StatPill label="초대대기" value="1" />
          </div>
          <OutlineButton weight="semibold" onClick={() => navigate('/team/manage')}>팀원 초대/관리</OutlineButton>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="typo-body-sm-bold text-main">공개 시점</span>
            <button type="button" onClick={goVisibility} className="flex items-center gap-0.5">
              <span className="typo-body-xs-semibold text-hint">설정하기</span>
              <ChevronRight className="size-3 text-hint" strokeWidth={1} />
            </button>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between border-b border-faint py-3">
              <span className="typo-body-sm-regular text-hint">전시작</span>
              <span className="typo-body-sm-regular text-main">
                {VISIBILITY_LABEL[artworkVisibility]}
              </span>
            </div>
            <div className="flex items-start justify-between py-3">
              <span className="typo-body-sm-regular text-hint">전시 콘텐츠</span>
              <span className="typo-body-sm-regular text-main">전시 등록과 동시에 공개</span>
            </div>
          </div>
        </section>

        {/* 기본 정보 수정 */}
        <button
          type="button"
          onClick={() => navigate('/exhibition/basic')}
          className="flex items-center gap-3 rounded-xl bg-card px-4 py-3"
        >
          <div className="flex flex-1 flex-col gap-1 text-left">
            <span className="typo-body-xs-bold text-main">기본 정보 수정</span>
            <span className="typo-body-xs-regular text-faint">
              전시명, 소개, 기간, 장소, 유의사항 수정
            </span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-hint" strokeWidth={1} />
        </button>

        {/* 안내 */}
        <div className="flex items-start gap-2 rounded-2xl bg-card p-3.5 mb-11.75">
          <Info className="size-4 shrink-0 text-faint" strokeWidth={1} />
          <p className="typo-body-xs-regular text-faint">
            전시 등록, 공개 시점 설정, 팀원 초대는 대표자만 할 수 있어요.
          </p>
        </div>
        </div>
      </div>

      <div className="flex gap-2.5 border-t border-line bg-card px-5 pb-8 pt-4 shadow-[0px_-4px_18px_0px_rgba(4,0,250,0.06)]">
        <button
          type="button"
          className="typo-body-sm-bold h-11 w-24 shrink-0 rounded-xl bg-bt-gray text-main"
        >
          임시저장
        </button>
        <button
          type="button"
          className="typo-body-sm-bold h-11 flex-1 rounded-xl bg-dark text-white"
          onClick={() => navigate('/')}
        >
          완료
        </button>
      </div>
    </div>
  );
}

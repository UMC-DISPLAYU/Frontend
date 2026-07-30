import { ChevronRight, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BottomButtonBar, PageHeader } from '@/components/common';
import {
  ExhibitionCard,
  OutlineButton,
  Section,
  StatPill,
  VisibilitySection,
} from '@/components/exhibition-manage';
import { useHideFooter } from '@/components/layout';
import { type VisibilityType } from '@/constants/visibility';
import type { ExhibitionItem } from '@/types/mypage';

export function ExhibitionManage() {
  useHideFooter();

  const navigate = useNavigate();
  const { state } = useLocation();

  const exhibition = {
    id: String(state?.displayId ?? state?.id ?? 1),
    status: state?.status ?? '전시예정',
    title: state?.placeName || '형태의 침묵',
    org: '중앙대학교 디자인학부',
    period: state?.period || '05.28 - 06.05',
    place: state?.address || '중앙대학교 310관 갤러리',
    thumbnail: 'https://placehold.co/130x162',
  };

  const artworkVisibility: VisibilityType = state?.artworkVisibility ?? 'startDate';
  const workExhibition: ExhibitionItem = exhibition;

  const goVisibility = () => {
    navigate('/exhibition/visibility', {
      state: { ...state, artworkVisibility },
    });
  };

  const goDisplayWork = () => {
    navigate('/display/manage', {
      state: { initialExhibition: workExhibition },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <PageHeader title="전시관리" onBack={() => navigate(-1)} />

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3">
        <div className="flex flex-col gap-5">
          <ExhibitionCard {...exhibition} />

          <Section
            title="전시 등록을 준비 중이에요"
            description="팀원과 함께 전시와 작품을 함께 준비해보세요."
          >
            <div className="flex gap-3">
              <StatPill label="전시 콘텐츠" value="3" />
              <StatPill label="작품" value="2" />
            </div>
            <OutlineButton onClick={goDisplayWork}>전시 작업으로 이동</OutlineButton>
          </Section>

          <Section title="팀원관리" description="닉네임 또는 초대 링크로 팀원을 초대할 수 있어요.">
            <div className="flex gap-3">
              <StatPill label="참여팀원" value="2" />
              <StatPill label="초대대기" value="1" />
            </div>
            <OutlineButton weight="semibold" onClick={() => navigate('/team/manage')}>
              팀원 초대/관리
            </OutlineButton>
          </Section>

          <VisibilitySection artworkVisibility={artworkVisibility} onSettingsClick={goVisibility} />

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

          <div className="flex items-start gap-2 rounded-2xl bg-card p-3.5 mb-11.75">
            <Info className="size-4 shrink-0 text-faint" strokeWidth={1} />
            <p className="typo-body-xs-regular text-faint">
              전시 등록, 공개 시점 설정, 팀원 초대는 대표자만 할 수 있어요.
            </p>
          </div>
        </div>
      </div>

      <BottomButtonBar>
        <div className="flex gap-2.5">
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
            등록하기
          </button>
        </div>
      </BottomButtonBar>
    </div>
  );
}

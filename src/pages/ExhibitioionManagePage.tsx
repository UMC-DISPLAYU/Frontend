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
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import type { ExhibitionItem } from '@/types/mypage';

const formatMonthDay = (date: string | undefined) => {
  if (!date) return '';
  const [, month, day] = date.split('-');
  return month && day ? `${month}.${day}` : date;
};

/* 전시 상세 응답이 period/location 객체 또는 평평한 필드로 오는 두 형태를 모두 다룹니다. */
type DisplaySource = {
  status?: string;
  title?: string;
  organization?: string | null;
  department?: string | null;
  placeName?: string;
  posterImageUrl?: string;
  startDate?: string;
  endDate?: string;
  period?: { startDate?: string; endDate?: string };
  location?: { placeName?: string };
  images?: { imageUrl?: string }[];
};

export function ExhibitionManage() {
  useHideFooter();

  const navigate = useNavigate();
  const { state } = useLocation();

  // 등록된 전시 데이터를 서버에서 불러옵니다. state는 등록 직후 화면 전환용으로만 사용합니다.
  const displayId = Number(state?.displayId ?? state?.id ?? 0);
  const { data: display } = useDisplayDetail(displayId);
  const { data: memberList } = useDisplayMembers(displayId);

  /* 팀원 목록의 accepted로 참여팀원과 초대대기를 나눕니다. */
  const teamMembers = memberList?.members ?? [];
  const acceptedCount = teamMembers.filter((member) => member.accepted !== false).length;
  const pendingCount = teamMembers.filter((member) => member.accepted === false).length;

  const source = display as DisplaySource | undefined;
  const startDate = source?.period?.startDate ?? source?.startDate;
  const endDate = source?.period?.endDate ?? source?.endDate;

  const period = source
    ? `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}`
    : (state?.period ?? '');

  const exhibition = {
    id: String(displayId || ''),
    status: source?.status ?? state?.status ?? '',
    title: source?.title ?? state?.title ?? '',
    org: source?.organization ?? source?.department ?? state?.school ?? state?.organizer ?? '',
    period,
    place: source?.location?.placeName ?? source?.placeName ?? state?.placeName ?? '',
    thumbnail:
      source?.posterImageUrl ??
      source?.images?.[0]?.imageUrl ??
      state?.posterImageUrl ??
      state?.imageUrls?.[0],
  };

  const artworkVisibility: VisibilityType = state?.artworkVisibility ?? 'startDate';
  const contentVisibility: VisibilityType = state?.contentVisibility ?? 'startDate';
  const workExhibition: ExhibitionItem = exhibition;

  const goVisibility = () => {
    navigate('/exhibition/visibility', {
      state: {
        ...state,
        displayId: displayId || undefined,
        startDate: startDate ?? state?.startDate,
        artworkVisibility,
        contentVisibility,
      },
    });
  };

  const goDisplayWork = () => {
    navigate('/display/manage', {
      state: { initialExhibition: workExhibition },
    });
  };

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
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
              <StatPill label="참여팀원" value={String(acceptedCount)} />
              <StatPill label="초대대기" value={String(pendingCount)} />
            </div>
            <OutlineButton
              weight="semibold"
              onClick={() => navigate(`/display/${displayId}/team/manage`)}
            >
              팀원 초대/관리
            </OutlineButton>
          </Section>

          <VisibilitySection
            artworkVisibility={artworkVisibility}
            contentVisibility={contentVisibility}
            startDate={startDate ?? state?.startDate}
            onSettingsClick={goVisibility}
          />

          <button
            type="button"
            onClick={() => navigate(`/exhibition/edit/${exhibition.id}`, { state })}
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
            onClick={() =>
              navigate('/exhibition/register-complete', {
                state: {
                  title: exhibition.title,
                  school: source?.organization ?? state?.school,
                  department: source?.department ?? state?.department,
                  organizer: state?.organizer,
                  placeName: exhibition.place,
                  artworkVisibility,
                  contentVisibility,
                },
              })
            }
          >
            등록하기
          </button>
        </div>
      </BottomButtonBar>
    </div>
  );
}

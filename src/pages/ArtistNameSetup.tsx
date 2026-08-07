import { useState } from 'react';

import { ChevronLeft, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { CreateDisplayRequestDto } from '@/api/dto';
import { DISPLAY_FIELD_MAP, DISPLAY_TYPE_MAP } from '@/constants/exhibition';
import { useCreateDisplay } from '@/hooks/queries/useDisplayBrowse';

interface SummaryRowProps {
  label: string;
  value: string;
}

type ExhibitionRegisterState = {
  imageUrls?: string[];
  title?: string;
  subtitle?: string;
  intro?: string;
  type?: string;
  field?: string[];
  school?: string;
  department?: string;
  organizer?: string;
  period?: string;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  placeName?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  contact?: string;
  notice?: string;
  artistName?: string;
};

const getRegion = (address: string): CreateDisplayRequestDto['region'] => {
  if (address.includes('서울')) return 'SEOUL';
  if (address.includes('경기') || address.includes('인천')) return 'GYEONGGI_INCHEON';

  return 'OTHERS';
};

const optionalText = (value?: string | null) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
};

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
  const registerState = (state ?? {}) as ExhibitionRegisterState;
  const createDisplay = useCreateDisplay();
  /* 뒤로 갔다 다시 들어와도 입력한 작가명이 남아 있도록 state로 초기화합니다. */
  const [artistName, setArtistName] = useState(registerState.artistName ?? '');

  const info = {
    title: registerState.title ?? '',
    org: registerState.school || registerState.organizer || '',
    period: registerState.period ?? '',
    role: '대표자',
  };

  const goCreate = () => {
    const type = registerState.type ? DISPLAY_TYPE_MAP[registerState.type] : undefined;
    const posterImageUrl = registerState.imageUrls?.[0];

    if (
      !artistName.trim() ||
      !type ||
      !posterImageUrl ||
      !registerState.title ||
      !registerState.startDate ||
      !registerState.endDate ||
      !registerState.startTime ||
      !registerState.endTime ||
      !registerState.placeName ||
      !registerState.address ||
      !registerState.contact?.trim() ||
      registerState.latitude === null ||
      registerState.latitude === undefined ||
      registerState.longitude === null ||
      registerState.longitude === undefined
    ) {
      return;
    }

    const requestBody: CreateDisplayRequestDto = {
      title: registerState.title.trim(),
      posterImageUrl,
      type,
      fields: registerState.field?.map((field) => DISPLAY_FIELD_MAP[field]).filter(Boolean) ?? [],
      region: getRegion(registerState.address),
      startDate: registerState.startDate,
      endDate: registerState.endDate,
      openTime: registerState.startTime,
      closeTime: registerState.endTime,
      locationName: registerState.placeName.trim(),
      latitude: registerState.latitude,
      longitude: registerState.longitude,
      roadAddress: registerState.address.trim(),
      /* 서버 필수 필드입니다. 작가명은 이 전시에서 쓸 표시명, 문의 방법은 Q&A 계정으로 들어갑니다. */
      displayNickname: artistName.trim(),
      qnaAccount: (registerState.contact ?? '').trim(),
      schoolOrOrganization: registerState.school ? registerState.school : null,
      departmentOrClub: registerState.school
        ? (optionalText(registerState.department) ?? null)
        : null,
      subtitle: optionalText(registerState.subtitle),
      description: optionalText(registerState.intro),
      precautions: optionalText(registerState.notice),
    };

    if (requestBody.fields.length === 0) {
      return;
    }

    createDisplay.mutate(requestBody, {
      onSuccess: (display) => {
        navigate(`/exhibition/${display.displayId}/manage`, {
          state: {
            ...registerState,
            artistName,
            displayId: display.displayId,
            posterImageUrl,
          },
        });
      },
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
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
          disabled={!artistName.trim() || createDisplay.isPending}
          onClick={goCreate}
          className="typo-body-sm-bold mt-4 h-11 w-full rounded-xl bg-dark text-white disabled:opacity-40"
        >
          {createDisplay.isPending ? '전시 등록 중' : '전시 관리 페이지 만들기'}
        </button>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import type { CreateDisplayRequestDto } from '@/api/dto';
import { BottomButton } from '@/components/common';
import { ExhibitionHeader } from '@/components/ui';
import { DISPLAY_FIELD_MAP, DISPLAY_TYPE_MAP } from '@/constants/exhibition';
import { useCreateDisplay } from '@/hooks/queries/useDisplayBrowse';
import { useUpdateMyDisplayNickname } from '@/hooks/queries/useMyDisplays';
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/useUserStore';

import { type ArtistNameSetupFormValues, artistNameSetupSchema } from './exhibitionRegister.schema';

interface SummaryRowProps {
  label: string;
  value: string;
}

type ExhibitionRegisterState = {
  id?: string | number;
  displayId?: number;
  isOwner?: boolean;
  isLeader?: boolean;
  imageUrls?: string[];
  title?: string;
  subtitle?: string;
  intro?: string;
  type?: string;
  field?: string[];
  school?: string;
  department?: string;
  organizer?: string;
  org?: string;
  period?: string;
  role?: string;
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
  displayNickname?: string;
};

const getRegion = (address: string): CreateDisplayRequestDto['region'] => {
  if (address.includes('서울')) return 'SEOUL';
  if (address.includes('경기') || address.includes('인천')) return 'GYEONGGI_INCHEON';

  return 'OTHERS';
};

const optionalText = (value?: string | null) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : '';
};

const formatPeriodLabel = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate || !endDate) {
    return '';
  }

  return `${startDate.split('-').join('.')} - ${endDate.split('-').join('.')}`;
};

const hasCompleteRegisterDraft = (draft: ExhibitionRegisterState) =>
  Boolean(
    draft.imageUrls?.[0] &&
    draft.title &&
    draft.type &&
    draft.field?.length &&
    draft.startDate &&
    draft.endDate &&
    draft.startTime &&
    draft.endTime &&
    draft.placeName &&
    draft.address &&
    draft.contact?.trim() &&
    draft.latitude !== null &&
    draft.latitude !== undefined &&
    draft.longitude !== null &&
    draft.longitude !== undefined,
  );

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
  const { draft, hasDraft, updateDraft, resetDraft } = useExhibitionRegisterDraft();
  const userMe = useAuthStore((s) => s.user);
  const userStoreName = useUserStore((s) => s.displayArtistName || s.artistName);

  const createDisplay = useCreateDisplay();
  const updateNickname = useUpdateMyDisplayNickname();

  const shouldUseDraft = hasDraft && hasCompleteRegisterDraft(draft);
  const registerState = {
    ...(state ?? {}),
    ...(shouldUseDraft ? draft : {}),
  } as ExhibitionRegisterState;

  const isEditMode = Boolean(registerState.displayId || registerState.id) && !shouldUseDraft;

  const isLeader = registerState.isLeader ?? registerState.isOwner ?? true;
  const roleLabel = registerState.role ?? (isLeader ? '대표자' : '팀원');

  const info = {
    title: registerState.title ?? '',
    org:
      registerState.org ||
      [registerState.school, registerState.department || registerState.organizer]
        .filter(Boolean)
        .join(' ') ||
      '',
    period:
      shouldUseDraft && draft.startDate && draft.endDate
        ? formatPeriodLabel(draft.startDate, draft.endDate)
        : (registerState.period ?? ''),
    role: roleLabel,
  };

  const initialArtistName =
    registerState.artistName ?? registerState.displayNickname ?? (userStoreName || '');

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = useForm<ArtistNameSetupFormValues>({
    resolver: zodResolver(artistNameSetupSchema),
    mode: 'onChange',
    defaultValues: {
      artistName: initialArtistName,
    },
  });
  const artistName = useWatch({ control, name: 'artistName' }) ?? '';

  useEffect(() => {
    if (initialArtistName && !getValues('artistName')) {
      setValue('artistName', initialArtistName, { shouldValidate: true });
    }
  }, [initialArtistName, getValues, setValue]);

  const saveCurrentDraft = () => {
    if (!isEditMode) {
      updateDraft({ artistName: getValues('artistName') });
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      updateDraft({ artistName });
    }
  }, [artistName, updateDraft, isEditMode]);

  const onSubmit = (data: ArtistNameSetupFormValues) => {
    const displayNickname = data.artistName.trim();

    if (isEditMode) {
      updateNickname.mutate(displayNickname, {
        onSuccess: () => {
          navigate('/my/exhibitions');
        },
      });
      return;
    }

    const type = registerState.type ? DISPLAY_TYPE_MAP[registerState.type] : undefined;
    const posterImageUrl = registerState.imageUrls?.[0];

    if (
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
      alert('이전 단계 정보가 유실됐어요. 전시 등록을 처음부터 다시 진행해주세요.');
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
      displayNickname,
      qnaAccount: (registerState.contact ?? '').trim(),
      schoolOrOrganization: optionalText(registerState.school || registerState.organizer) ?? '',
      departmentOrClub: optionalText(registerState.department),
      subtitle: optionalText(registerState.subtitle),
      description: optionalText(registerState.intro),
      precautions: optionalText(registerState.notice),
    };

    if (requestBody.fields.length === 0) {
      return;
    }

    createDisplay.mutate(requestBody, {
      onSuccess: (display) => {
        resetDraft();
        navigate(`/exhibition/${display.displayId}/manage`, {
          state: {
            ...registerState,
            artistName: displayNickname,
            displayId: display.displayId,
            posterImageUrl,
          },
        });
      },
    });
  };

  const isPending = createDisplay.isPending || updateNickname.isPending;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page">
      <ExhibitionHeader
        title={isEditMode ? '전시 작가명 수정' : '전시 작가명 설정'}
        onBack={() => {
          saveCurrentDraft();
          navigate(-1);
        }}
      />

      <main className="flex min-h-0 flex-1 overflow-hidden px-5">
        <form
          id="artist-name-setup-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-5"
        >
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
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1">
                <span className="typo-body-sm-bold text-main">전시 작가명</span>
                <span className="typo-body-xs-regular text-error">*</span>
              </div>
              <div className="border-b border-input-border px-3 py-2.5">
                <input
                  placeholder="홍길동"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                  {...register('artistName')}
                />
              </div>
            </div>
            {errors.artistName && (
              <span className="typo-body-xxs-regular text-error px-2">
                {errors.artistName.message}
              </span>
            )}
            <p className="typo-body-xxs-regular text-faint">
              실명 또는 이 전시에서 사용할 작가명을 입력해주세요.
            </p>
          </div>
          <div className="mt-auto pb-6">
            <div className="flex items-start gap-2 rounded-2xl bg-card p-3.5">
              <Info className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1} />
              <p className="typo-body-xs-regular text-faint">
                입력한 작가명은 팀원 목록, 전시작 등록자 표시, Q&amp;A 담당자 지정에 사용돼요. 작품
                등록 시 기본 작가명으로 자동 입력되며, 공동작업이나 팀명 표기가 필요한 경우 작품별로
                수정할 수 있어요.
              </p>
            </div>
          </div>
        </form>
      </main>

      <BottomButton form="artist-name-setup-form" type="submit" disabled={!isValid || isPending}>
        {isPending
          ? isEditMode
            ? '수정 중'
            : '전시 등록 중'
          : isEditMode
            ? '수정 완료'
            : '전시 관리 페이지 만들기'}
      </BottomButton>
    </div>
  );
}

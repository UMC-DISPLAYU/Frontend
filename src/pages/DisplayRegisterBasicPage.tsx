import { useEffect, useId, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import type { AddressSearchResultDto } from '@/api/dto';
import {
  AddressSearchView,
  BIG_BUTTON_CLASS,
  buildUpdateDisplayRequest,
  DisplayEditDraftGate,
  DisplayLinkField,
  DisplayPeriodSheet,
  DisplayPickerButton,
  displayRegisterBasicSchema,
  type DisplayRegisterBasicValues,
  DisplayRegisterCta,
  DisplayRegisterHeader,
  DisplayRegisterProgress,
  DisplayTimeSheet,
  FIELD_CLASS,
  formatDotDate,
  HELP_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  MAX_PLACE_NAME_LENGTH,
  parseInstagramId,
  parseWebsiteUrl,
  REQUIRED_CLASS,
  UNDERLINE_CLASS,
} from '@/components/display-register';
import { PageContainer } from '@/components/layout';
import type { ExhibitionRegisterDraft } from '@/contexts/exhibitionRegisterDraftState';
import { useUpdateDisplay } from '@/hooks/queries/useDisplayBrowse';
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';

const REQUIRED_MARK = (
  <span aria-hidden="true" className={REQUIRED_CLASS}>
    *
  </span>
);

type Sheet = { kind: 'period' | 'time'; key: number };

const toDraft = (values: Partial<DisplayRegisterBasicValues>): Partial<ExhibitionRegisterDraft> => {
  const instagram = parseInstagramId(values.instagram ?? '');
  const website = parseWebsiteUrl(values.website ?? '');

  return {
    startDate: values.startDate ?? '',
    endDate: values.endDate ?? '',
    startTime: values.startTime ?? '',
    endTime: values.endTime ?? '',
    placeName: values.placeName?.trim() ?? '',
    address: values.address ?? '',
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    instagramId: instagram.status === 'valid' ? instagram.value : '',
    websiteUrl: website.status === 'valid' ? website.href : '',
  };
};

function DisplayRegisterBasicForm() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const editDisplayId = Number(useParams().displayId) || null;
  const isEdit = editDisplayId !== null;
  const updateDisplay = useUpdateDisplay(editDisplayId ?? undefined);
  const periodLabelId = useId();
  const timeLabelId = useId();
  const addressLabelId = useId();
  const addressButtonId = useId();

  const { draft, updateDraft } = useExhibitionRegisterDraft();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const formScrollRef = useRef(0);
  const savedWebsite = parseWebsiteUrl(draft.websiteUrl);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<DisplayRegisterBasicValues>({
    resolver: zodResolver(displayRegisterBasicSchema),
    mode: 'onChange',
    defaultValues: {
      startDate: draft.startDate,
      endDate: draft.endDate,
      startTime: draft.startTime,
      endTime: draft.endTime,
      placeName: draft.placeName,
      address: draft.address,
      latitude: draft.latitude ?? undefined,
      longitude: draft.longitude ?? undefined,
      instagram: draft.instagramId,
      website: savedWebsite.status === 'valid' ? savedWebsite.value : '',
    },
  });

  const values = useWatch({ control });

  const closeAddress = () => {
    setIsAddressOpen(false);
    // 주소 검색 화면이 사라지면 포커스가 갈 곳이 없어, 원래 위치와 주소 버튼으로 되돌린다
    requestAnimationFrame(() => {
      window.scrollTo({ top: formScrollRef.current });
      document.getElementById(addressButtonId)?.focus({ preventScroll: true });
    });
  };
  // 주소 검색은 같은 페이지 안의 화면이라, 뒤로가기로 2/2 입력 화면에 돌아오도록 기록을 하나 쌓는다
  const { requestClose: requestAddressClose } = useOverlayHistory(isAddressOpen, closeAddress);

  // 1/2 로 돌아가거나(뒤로가기 포함) 화면을 떠날 때 입력한 값을 draft 에 남긴다
  const updateDraftRef = useRef(updateDraft);
  const getValuesRef = useRef(getValues);
  useEffect(() => {
    updateDraftRef.current = updateDraft;
    getValuesRef.current = getValues;
  });
  useEffect(() => () => updateDraftRef.current(toDraft(getValuesRef.current())), []);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, []);

  const openSheet = (kind: Sheet['kind']) => {
    setSheet((prev) => ({ kind, key: (prev?.key ?? 0) + 1 }));
    setIsSheetOpen(true);
  };

  const openAddress = () => {
    formScrollRef.current = window.scrollY;
    setIsAddressOpen(true);
    window.scrollTo({ top: 0 });
  };

  const selectAddress = (result: AddressSearchResultDto) => {
    const options = { shouldValidate: true, shouldDirty: true };

    setValue('address', result.roadAddress || result.jibunAddress, options);
    setValue('latitude', result.latitude, options);
    setValue('longitude', result.longitude, options);
    requestAddressClose();
  };

  const saveEdit = (nextDraft: ExhibitionRegisterDraft) => {
    const request = buildUpdateDisplayRequest(nextDraft);

    if (!request) {
      toast('입력하지 않은 항목이 있어요. 1/2 화면을 확인해주세요');
      return;
    }

    updateDisplay.mutate(request, {
      onSuccess: () => {
        toast('전시 정보를 수정했어요');
        // 수정 1/2 · 2/2 기록을 지나 들어오기 전 화면(전시 관리)으로 돌아간다
        const historyIndex = window.history.state?.idx;
        if (typeof historyIndex === 'number' && historyIndex >= 2) {
          navigate(-2);
          return;
        }
        navigate(`/exhibition/${editDisplayId}/manage`, { replace: true });
      },
      onError: (error) => {
        toast(getErrorMessage(error, '전시 정보를 수정하지 못했어요. 다시 시도해주세요'));
      },
    });
  };

  const onSubmit = (data: DisplayRegisterBasicValues) => {
    const basicStep = toDraft(data);

    updateDraft(basicStep);

    if (isEdit) {
      saveEdit({ ...draft, ...basicStep });
      return;
    }

    navigate('/exhibition/register/artist', { state: { ...draft, ...basicStep } });
  };

  const instagram = parseInstagramId(values.instagram ?? '');
  const website = parseWebsiteUrl(values.website ?? '');

  return (
    // 프로토타입은 태블릿 · 데스크톱에서도 입력 칸 바깥까지 흰 화면이다
    <div className="min-h-dvh bg-primary-white">
      <PageContainer variant="form" className="bg-primary-white">
        <DisplayRegisterHeader
          title={isAddressOpen ? '주소 검색' : '전시 기본 정보'}
          onBack={isAddressOpen ? requestAddressClose : flowBack}
        />

        {isAddressOpen && <AddressSearchView onSelect={selectAddress} />}

        <main hidden={isAddressOpen} className="flex flex-1 flex-col">
          <form
            id="display-register-basic-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1"
          >
            <DisplayRegisterProgress step={2} label="02 일정과 장소" />

            <div className={FIELD_CLASS}>
              <span id={periodLabelId} className={LABEL_CLASS}>
                <span>
                  전시 기간
                  {REQUIRED_MARK}
                </span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <DisplayPickerButton
                  labelId={periodLabelId}
                  placeholder="시작일"
                  value={values.startDate ? formatDotDate(values.startDate) : ''}
                  haspopup="dialog"
                  onClick={() => openSheet('period')}
                />
                <DisplayPickerButton
                  labelId={periodLabelId}
                  placeholder="종료일"
                  value={values.endDate ? formatDotDate(values.endDate) : ''}
                  haspopup="dialog"
                  onClick={() => openSheet('period')}
                />
              </div>
            </div>

            <div className={FIELD_CLASS}>
              <span id={timeLabelId} className={LABEL_CLASS}>
                <span>
                  운영 시간
                  {REQUIRED_MARK}
                </span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <DisplayPickerButton
                  labelId={timeLabelId}
                  placeholder="시작 시간"
                  value={values.startTime ?? ''}
                  haspopup="dialog"
                  onClick={() => openSheet('time')}
                />
                <DisplayPickerButton
                  labelId={timeLabelId}
                  placeholder="종료 시간"
                  value={values.endTime ?? ''}
                  haspopup="dialog"
                  onClick={() => openSheet('time')}
                />
              </div>
            </div>

            <div className={FIELD_CLASS}>
              <label htmlFor="display-place-name" className={LABEL_CLASS}>
                <span>
                  장소명 (상세 위치)
                  {REQUIRED_MARK}
                </span>
              </label>
              <div className={UNDERLINE_CLASS}>
                <input
                  id="display-place-name"
                  maxLength={MAX_PLACE_NAME_LENGTH}
                  autoComplete="off"
                  placeholder="입력해 주세요"
                  aria-describedby="display-place-name-help"
                  className={INPUT_CLASS}
                  {...register('placeName')}
                />
              </div>
              <p id="display-place-name-help" className={HELP_CLASS}>
                찾아오기 쉽도록 건물·층·호수를 적어주세요
              </p>
            </div>

            <div className={FIELD_CLASS}>
              <span id={addressLabelId} className={LABEL_CLASS}>
                <span>
                  주소
                  {REQUIRED_MARK}
                </span>
              </span>
              <DisplayPickerButton
                id={addressButtonId}
                labelId={addressLabelId}
                placeholder="주소 검색"
                value={values.address ?? ''}
                icon="search"
                onClick={openAddress}
              />
              <p className={HELP_CLASS}>검색 결과에서 전시 장소의 주소를 선택해주세요</p>
            </div>

            <Controller
              control={control}
              name="instagram"
              render={({ field }) => (
                <DisplayLinkField
                  label="인스타그램"
                  parsed={instagram}
                  maxLength={60}
                  placeholder="ex) displayu"
                  idleHelp="@ 없이 아이디만 적어주세요"
                  validHelp={
                    instagram.status === 'valid'
                      ? `instagram.com/${instagram.value} 로 연결돼요`
                      : ''
                  }
                  errorMessage="아이디 형식을 확인해 주세요 (영문·숫자·밑줄·마침표)"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => {
                    // @ 나 주소를 붙여 넣어도 아이디만 남긴다
                    if (instagram.status === 'valid') field.onChange(instagram.value);
                    field.onBlur();
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="website"
              render={({ field }) => (
                <DisplayLinkField
                  label="웹사이트"
                  parsed={website}
                  maxLength={120}
                  inputMode="url"
                  placeholder="ex) www.displayu.co.kr"
                  idleHelp="전시 사이트나 포트폴리오 주소를 적어주세요"
                  validHelp={website.status === 'valid' ? `${website.href} 로 연결돼요` : ''}
                  errorMessage="주소 형식을 확인해 주세요 (예: www.displayu.co.kr)"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => {
                    if (website.status === 'valid') field.onChange(website.value);
                    field.onBlur();
                  }}
                />
              )}
            />
          </form>

          <DisplayRegisterCta>
            <button
              form="display-register-basic-form"
              type="submit"
              disabled={!isValid || updateDisplay.isPending}
              className={BIG_BUTTON_CLASS}
            >
              {isEdit ? (updateDisplay.isPending ? '저장하는 중…' : '수정 완료') : '다음'}
            </button>
          </DisplayRegisterCta>
        </main>

        {sheet && (
          <>
            <DisplayPeriodSheet
              key={`period-${sheet.key}`}
              open={isSheetOpen && sheet.kind === 'period'}
              initialRange={{ start: values.startDate || null, end: values.endDate || null }}
              onClose={() => setIsSheetOpen(false)}
              onConfirm={({ start, end }) => {
                setValue('startDate', start, { shouldValidate: true, shouldDirty: true });
                setValue('endDate', end, { shouldValidate: true, shouldDirty: true });
                setIsSheetOpen(false);
              }}
            />
            <DisplayTimeSheet
              key={`time-${sheet.key}`}
              open={isSheetOpen && sheet.kind === 'time'}
              initialStart={values.startTime ?? ''}
              initialEnd={values.endTime ?? ''}
              onClose={() => setIsSheetOpen(false)}
              onConfirm={({ start, end }) => {
                setValue('startTime', start, { shouldValidate: true, shouldDirty: true });
                setValue('endTime', end, { shouldValidate: true, shouldDirty: true });
                setIsSheetOpen(false);
              }}
            />
          </>
        )}
      </PageContainer>
    </div>
  );
}

/** 수정(/exhibition/:displayId/edit…)이면 전시 상세를 draft 에 채운 뒤 같은 폼을 그린다 */
export function DisplayRegisterBasicPage() {
  const isEdit = Boolean(useParams().displayId);

  if (!isEdit) return <DisplayRegisterBasicForm />;

  return (
    <DisplayEditDraftGate>
      <DisplayRegisterBasicForm />
    </DisplayEditDraftGate>
  );
}

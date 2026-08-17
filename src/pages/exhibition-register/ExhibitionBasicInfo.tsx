import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomFixedBar } from '@/components/common';
import { AddressSearchModal } from '@/components/exhibition-basic-info';
import { ExhibitionHeader } from '@/components/ui';
import { CalenderSheet } from '@/components/ui/CalenderSheet';
import { type TimeRangeValue, TimeSheet } from '@/components/ui/TimeSheet';
import { DISPLAY_FIELD_MAP, DISPLAY_TYPE_MAP } from '@/constants/exhibition';
import { useUpdateDisplay } from '@/hooks/queries/useDisplayBrowse';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useExhibitionRegisterDraft } from '@/hooks/useExhibitionRegisterDraft';
import { useFlowBack } from '@/hooks/useFlowBack';

import {
  type ExhibitionBasicInfoFormValues,
  exhibitionBasicInfoSchema,
  type ExhibitionRegisterFormValues,
} from './exhibitionRegister.schema';

interface DateValue {
  start: Date;
  end: Date;
  label: string;
}

type SheetType = 'date' | 'time' | null;

const pad = (value: number) => String(value).padStart(2, '0');
const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatTime = (hour: number, minute: number) => `${pad(hour)}:${pad(minute)}`;
const parseTime = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);

  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
};

function Underline({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 border-b border-input-border px-3 py-2.5 ${className}`}
    >
      {children}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span className="typo-body-sm-bold text-main">{children}</span>
      {required && <span className="typo-body-xs-regular text-error">*</span>}
    </div>
  );
}

export function ExhibitionBasicInfo() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const { state } = useLocation();
  const locationState = useMemo(
    () =>
      (state ?? {}) as Partial<
        ExhibitionRegisterFormValues &
          ExhibitionBasicInfoFormValues & {
            displayDetail: DisplayDetailDto;
            imageUrls: string[];
            intro: string;
            periodValue: DateValue;
            operatingHoursValue: TimeRangeValue;
          }
      >,
    [state],
  );
  const { draft, hasDraft, updateDraft } = useExhibitionRegisterDraft();
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const shouldUseDraft = displayId === 0 && hasDraft;
  const updateDisplay = useUpdateDisplay(displayId);

  const { data: fetchedDetail, isPending: isDetailPending } = useDisplayDetail(displayId);
  const isFetchingDetail = displayId > 0 && !locationState.displayDetail && isDetailPending;

  const restored = useMemo(() => {
    return displayId > 0 && !locationState.displayDetail ? {} : locationState;
  }, [displayId, locationState]);

  const displayDetail = locationState.displayDetail || fetchedDetail || null;

  const parseDate = (d?: string) => (d ? new Date(d) : new Date());

  const initialPeriod =
    shouldUseDraft && draft.startDate && draft.endDate
      ? {
          start: parseDate(draft.startDate),
          end: parseDate(draft.endDate),
          label: `${draft.startDate.split('-').join('.')} - ${draft.endDate.split('-').join('.')}`,
        }
      : ((restored.periodValue as DateValue) ??
        (displayDetail?.period
          ? {
              start: parseDate(displayDetail.period.startDate),
              end: parseDate(displayDetail.period.endDate),
              label: `${displayDetail.period.startDate.split('-').join('.')} - ${displayDetail.period.endDate.split('-').join('.')}`,
            }
          : null));

  const initialOperatingHours =
    shouldUseDraft && draft.startTime && draft.endTime
      ? {
          startHour: parseTime(draft.startTime).hour,
          startMinute: parseTime(draft.startTime).minute,
          endHour: parseTime(draft.endTime).hour,
          endMinute: parseTime(draft.endTime).minute,
          label: `${draft.startTime} - ${draft.endTime}`,
        }
      : ((restored.operatingHoursValue as TimeRangeValue) ??
        (displayDetail?.period
          ? {
              startHour: parseInt(displayDetail.period.startTime.split(':')[0] || '0'),
              startMinute: parseInt(displayDetail.period.startTime.split(':')[1] || '0'),
              endHour: parseInt(displayDetail.period.endTime.split(':')[0] || '0'),
              endMinute: parseInt(displayDetail.period.endTime.split(':')[1] || '0'),
              label: `${displayDetail.period.startTime} - ${displayDetail.period.endTime}`,
            }
          : null));

  const [selectedPeriod, setSelectedPeriod] = useState<DateValue | null>(null);
  const [selectedOperatingHours, setSelectedOperatingHours] = useState<TimeRangeValue | null>(null);
  const period = selectedPeriod ?? initialPeriod;
  const operatingHours = selectedOperatingHours ?? initialOperatingHours;
  const [sheet, setSheet] = useState<SheetType>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExhibitionBasicInfoFormValues>({
    resolver: zodResolver(exhibitionBasicInfoSchema),
    mode: 'onChange',
    defaultValues: {
      startDate: initialPeriod ? formatDate(initialPeriod.start) : '',
      endDate: initialPeriod ? formatDate(initialPeriod.end) : '',
      startTime: initialOperatingHours
        ? formatTime(initialOperatingHours.startHour, initialOperatingHours.startMinute)
        : '',
      endTime: initialOperatingHours
        ? formatTime(initialOperatingHours.endHour, initialOperatingHours.endMinute)
        : '',
      placeName: shouldUseDraft
        ? draft.placeName
        : ((restored.placeName as string) ?? displayDetail?.location?.placeName ?? ''),
      address: shouldUseDraft
        ? draft.address
        : ((restored.address as string) ?? displayDetail?.location?.roadAddress ?? ''),
      latitude: shouldUseDraft
        ? (draft.latitude ?? undefined)
        : ((restored.latitude as number) ?? displayDetail?.location?.latitude ?? undefined),
      longitude: shouldUseDraft
        ? (draft.longitude ?? undefined)
        : ((restored.longitude as number) ?? displayDetail?.location?.longitude ?? undefined),
      contact: shouldUseDraft
        ? draft.contact
        : ((restored.contact as string) ?? displayDetail?.qnaAccount ?? ''),
      notice: shouldUseDraft
        ? draft.notice
        : ((restored.notice as string) ?? displayDetail?.note ?? ''),
    },
  });

  const notice = useWatch({ control, name: 'notice' }) ?? '';
  const [
    watchedStartDate,
    watchedEndDate,
    watchedStartTime,
    watchedEndTime,
    watchedPlaceName,
    watchedAddress,
    watchedLatitude,
    watchedLongitude,
    watchedContact,
    watchedNotice,
  ] = useWatch({
    control,
    name: [
      'startDate',
      'endDate',
      'startTime',
      'endTime',
      'placeName',
      'address',
      'latitude',
      'longitude',
      'contact',
      'notice',
    ],
  });

  useEffect(() => {
    if (shouldUseDraft) {
      return;
    }

    if (displayId > 0 && !locationState.displayDetail && fetchedDetail) {
      const restoredPeriod =
        (restored.periodValue as DateValue) ??
        (fetchedDetail.period
          ? {
              start: parseDate(fetchedDetail.period.startDate),
              end: parseDate(fetchedDetail.period.endDate),
              label: `${fetchedDetail.period.startDate.split('-').join('.')} - ${fetchedDetail.period.endDate.split('-').join('.')}`,
            }
          : null);

      const restoredHours =
        (restored.operatingHoursValue as TimeRangeValue) ??
        (fetchedDetail.period
          ? {
              startHour: parseInt(fetchedDetail.period.startTime.split(':')[0] || '0'),
              startMinute: parseInt(fetchedDetail.period.startTime.split(':')[1] || '0'),
              endHour: parseInt(fetchedDetail.period.endTime.split(':')[0] || '0'),
              endMinute: parseInt(fetchedDetail.period.endTime.split(':')[1] || '0'),
              label: `${fetchedDetail.period.startTime} - ${fetchedDetail.period.endTime}`,
            }
          : null);

      const restoredAddress =
        (restored.address as string) ?? fetchedDetail.location?.roadAddress ?? '';

      reset({
        startDate: restoredPeriod ? formatDate(restoredPeriod.start) : '',
        endDate: restoredPeriod ? formatDate(restoredPeriod.end) : '',
        startTime: restoredHours
          ? formatTime(restoredHours.startHour, restoredHours.startMinute)
          : '',
        endTime: restoredHours ? formatTime(restoredHours.endHour, restoredHours.endMinute) : '',
        placeName: (restored.placeName as string) ?? fetchedDetail.location?.placeName ?? '',
        address: restoredAddress,
        latitude: (restored.latitude as number) ?? fetchedDetail.location?.latitude ?? null,
        longitude: (restored.longitude as number) ?? fetchedDetail.location?.longitude ?? null,
        contact: (restored.contact as string) ?? fetchedDetail.qnaAccount ?? '',
        notice: (restored.notice as string) ?? fetchedDetail.note ?? '',
      });
    }
  }, [displayId, state, fetchedDetail, restored, reset, shouldUseDraft]);

  useEffect(() => {
    if (displayId > 0) {
      return;
    }

    updateDraft({
      startDate: watchedStartDate ?? '',
      endDate: watchedEndDate ?? '',
      startTime: watchedStartTime ?? '',
      endTime: watchedEndTime ?? '',
      placeName: watchedPlaceName ?? '',
      address: watchedAddress ?? '',
      latitude: watchedLatitude ?? null,
      longitude: watchedLongitude ?? null,
      contact: watchedContact ?? '',
      notice: watchedNotice ?? '',
    });
  }, [
    watchedStartDate,
    watchedEndDate,
    watchedStartTime,
    watchedEndTime,
    watchedPlaceName,
    watchedAddress,
    watchedLatitude,
    watchedLongitude,
    watchedContact,
    watchedNotice,
    updateDraft,
    displayId,
  ]);

  const saveCurrentDraft = () => {
    if (displayId > 0) {
      return;
    }

    const values = getValues();
    updateDraft({
      startDate: values.startDate,
      endDate: values.endDate,
      startTime: values.startTime,
      endTime: values.endTime,
      placeName: values.placeName,
      address: values.address,
      latitude: values.latitude,
      longitude: values.longitude,
      contact: values.contact ?? '',
      notice: values.notice ?? '',
    });
  };

  const canSubmit = exhibitionBasicInfoSchema.safeParse({
    startDate: watchedStartDate ?? '',
    endDate: watchedEndDate ?? '',
    startTime: watchedStartTime ?? '',
    endTime: watchedEndTime ?? '',
    placeName: watchedPlaceName ?? '',
    address: watchedAddress ?? '',
    latitude: watchedLatitude,
    longitude: watchedLongitude,
    contact: watchedContact ?? '',
    notice: watchedNotice ?? '',
  }).success;

  const handleAddressConfirm = (
    fullAddress: string,
    detailAddress: string,
    lat: number,
    lng: number,
  ) => {
    setValue('address', fullAddress, { shouldValidate: true });
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  };

  const onFormSubmit = (data: ExhibitionBasicInfoFormValues) => {
    if (displayId > 0) {
      updateDisplay.mutate(
        {
          title: locationState.title ?? fetchedDetail?.title ?? '',
          subtitle: locationState.subtitle ?? fetchedDetail?.subtitle ?? null,
          description: locationState.intro ?? fetchedDetail?.content ?? null,
          type:
            (locationState.type ? DISPLAY_TYPE_MAP[locationState.type] : undefined) ??
            fetchedDetail?.displayType ??
            'PERSONAL',
          fields:
            locationState.field?.map((f) => DISPLAY_FIELD_MAP[f]).filter(Boolean) ??
            fetchedDetail?.displayFields ??
            [],
          schoolOrOrganization:
            locationState.school || locationState.organizer || fetchedDetail?.organization || '',
          departmentOrClub: locationState.department ?? fetchedDetail?.department ?? null,
          placeName: data.placeName.trim(),
          precautions: data.notice?.trim() || null,
          startDate: data.startDate,
          endDate: data.endDate,
          openTime: data.startTime,
          closeTime: data.endTime,
          posterImageUrl:
            locationState.imageUrls?.[0] ?? fetchedDetail?.images?.[0]?.imageUrl ?? undefined,
        },
        {
          onSuccess: () => navigate(`/exhibition/${displayId}/manage`, { replace: true }),
          onError: () => alert('수정에 실패했습니다.'),
        },
      );
      return;
    }

    updateDraft({
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      placeName: data.placeName.trim(),
      address: data.address.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      contact: data.contact?.trim() ?? '',
      notice: data.notice?.trim() || '',
    });

    navigate('/exhibition/register/artist', {
      state: {
        ...state,
        period: period?.label ?? '',
        periodValue: period,
        operatingHoursValue: operatingHours,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        openHours: operatingHours?.label ?? '',
        placeName: data.placeName.trim(),
        address: data.address.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        contact: data.contact?.trim() ?? '',
        notice: data.notice?.trim() || '',
      },
    });
  };

  return (
    <div className="mx-auto min-h-dvh w-96 bg-page">
      <ExhibitionHeader
        title="전시 기본 정보"
        onBack={() => {
          saveCurrentDraft();
          flowBack();
        }}
      />

      <div className="px-5 pb-bottom-bar-offset">
        <form
          id="exhibition-basic-info-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-6"
        >
          {/* 전시기간 · 운영시간 */}
          <div className="flex items-start gap-3">
            <div className="flex flex-1 flex-col gap-3">
              <Label required>전시기간</Label>
              <Controller
                control={control}
                name="startDate"
                render={() => (
                  <button type="button" onClick={() => setSheet('date')} className="w-full">
                    <Underline>
                      <Calendar className="size-4 shrink-0 text-main" strokeWidth={1} />
                      <span
                        className={`typo-body-xs-regular truncate ${
                          period ? 'text-main' : 'text-input-placeholder'
                        }`}
                      >
                        {period?.label ?? '날짜선택'}
                      </span>
                    </Underline>
                  </button>
                )}
              />
              {errors.endDate && (
                <span className="typo-body-xxs-regular text-error px-2">
                  {errors.endDate.message}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <Label required>운영시간</Label>
              <Controller
                control={control}
                name="startTime"
                render={() => (
                  <button type="button" onClick={() => setSheet('time')} className="w-full">
                    <Underline>
                      <Clock className="size-4 shrink-0 text-main" strokeWidth={1} />
                      <span
                        className={`typo-body-xs-regular truncate ${
                          operatingHours ? 'text-main' : 'text-input-placeholder'
                        }`}
                      >
                        {operatingHours?.label ?? '시간선택'}
                      </span>
                    </Underline>
                  </button>
                )}
              />
              {errors.endTime && (
                <span className="typo-body-xxs-regular text-error px-2">
                  {errors.endTime.message}
                </span>
              )}
            </div>
          </div>

          {/* 장소명 */}
          <div className="flex flex-col gap-3">
            <Label required>장소명</Label>
            <Underline>
              <input
                id="place-name"
                placeholder="장소명을 입력해주세요"
                className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                {...register('placeName')}
              />
            </Underline>
            {errors.placeName && (
              <span className="typo-body-xxs-regular text-error px-2">
                {errors.placeName.message}
              </span>
            )}
          </div>

          {/* 주소 */}
          <div className="flex flex-col gap-3">
            <Label required>주소</Label>
            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="address"
                render={({ field: { value } }) => (
                  <Underline className="flex-1">
                    <MapPin className="size-4 shrink-0 text-input-placeholder" strokeWidth={1} />
                    <input
                      id="address"
                      value={value}
                      readOnly
                      placeholder="주소를 검색해주세요"
                      className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                    />
                  </Underline>
                )}
              />
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="typo-body-xs-bold shrink-0 rounded-lg bg-card px-4 py-2.5 text-main outline outline-1 outline-offset-[-1px] outline-sub600"
              >
                검색
              </button>
            </div>
            {errors.address && (
              <span className="typo-body-xxs-regular text-error px-2">
                {errors.address.message}
              </span>
            )}
          </div>

          {/* 문의 방법 */}
          <div className="flex flex-col gap-3">
            <Label>문의 방법</Label>
            <div className="flex flex-col gap-1.5">
              <Underline>
                <input
                  id="contact"
                  placeholder="문의 계정 또는 연락처를 입력해주세요"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                  {...register('contact')}
                />
              </Underline>
              <p className="typo-body-xxs-regular text-faint">@displayu_oo / example@email.com</p>
              {errors.contact && (
                <span className="typo-body-xxs-regular text-error px-2">
                  {errors.contact.message}
                </span>
              )}
            </div>
          </div>

          {/* 유의사항 */}
          <div className="flex flex-col gap-3">
            <Label>유의사항</Label>
            <div className="flex flex-col gap-1.5">
              <Underline className="items-start">
                <div className="flex h-28 w-full flex-col justify-between">
                  <textarea
                    id="notice"
                    placeholder="관람 전 알아두면 좋은 내용을 입력해주세요"
                    className="typo-body-xs-regular w-full flex-1 resize-none bg-transparent text-main outline-none placeholder:text-input-placeholder"
                    {...register('notice')}
                  />
                  <span className="typo-body-xs-regular self-end text-faint">
                    {notice.length}/500
                  </span>
                </div>
              </Underline>
              <p className="typo-body-xxs-regular text-faint">
                날짜별 운영 시간이 다르거나 예약, 출입 안내가 있다면 이곳에 적어주세요.
              </p>
              {errors.notice && (
                <span className="typo-body-xxs-regular text-error px-2">
                  {errors.notice.message}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      <BottomFixedBar>
        <button
          form="exhibition-basic-info-form"
          type="submit"
          disabled={!canSubmit || updateDisplay.isPending || isFetchingDetail}
          className="typo-body-sm-bold inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-dark py-3 text-card disabled:opacity-40"
        >
          {updateDisplay.isPending || isFetchingDetail
            ? '로딩 중'
            : displayId > 0
              ? '저장'
              : '다음'}
        </button>
      </BottomFixedBar>

      <CalenderSheet
        open={sheet === 'date'}
        onClose={() => setSheet(null)}
        value={period}
        onConfirm={(nextVal) => {
          setSelectedPeriod(nextVal);
          if (nextVal) {
            setValue('startDate', formatDate(nextVal.start), { shouldValidate: true });
            setValue('endDate', formatDate(nextVal.end), { shouldValidate: true });
          }
        }}
      />
      <TimeSheet
        open={sheet === 'time'}
        onClose={() => setSheet(null)}
        value={operatingHours}
        onConfirm={(nextVal) => {
          setSelectedOperatingHours(nextVal);
          if (nextVal) {
            setValue('startTime', formatTime(nextVal.startHour, nextVal.startMinute), {
              shouldValidate: true,
            });
            setValue('endTime', formatTime(nextVal.endHour, nextVal.endMinute), {
              shouldValidate: true,
            });
          }
        }}
      />
      <AddressSearchModal
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />
    </div>
  );
}

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';

import { Calendar, Clock } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomButtonBar } from '@/components/common';
import { AddressSearchModal } from '@/components/exhibition-basic-info';
import { ExhibitionHeader, RequiredLabel } from '@/components/ui';
import { CalenderSheet } from '@/components/ui/CalenderSheet';
import { type TimeRangeValue, TimeSheet } from '@/components/ui/TimeSheet';
import { useUpdateDisplay } from '@/hooks/queries/useDisplayBrowse';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';

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

/* 밑줄형 입력 래퍼 */

export function ExhibitionBasicInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const updateDisplay = useUpdateDisplay(displayId);

  const { data: fetchedDetail, isPending: isDetailPending } = useDisplayDetail(displayId);
  const isFetchingDetail = displayId > 0 && !state?.displayDetail && isDetailPending;

  const restored = useMemo(() => {
    return displayId > 0 && !state?.displayDetail ? {} : (state ?? {});
  }, [displayId, state]);

  const displayDetail = (state?.displayDetail as DisplayDetailDto) || fetchedDetail || null;

  const parseDate = (d?: string) => (d ? new Date(d) : new Date());

  const initialPeriod =
    (restored.periodValue as DateValue) ??
    (displayDetail?.period
      ? {
          start: parseDate(displayDetail.period.startDate),
          end: parseDate(displayDetail.period.endDate),
          label: `${displayDetail.period.startDate.split('-').join('.')} - ${displayDetail.period.endDate.split('-').join('.')}`,
        }
      : null);

  const initialOperatingHours =
    (restored.operatingHoursValue as TimeRangeValue) ??
    (displayDetail?.period
      ? {
          startHour: parseInt(displayDetail.period.startTime.split(':')[0] || '0'),
          startMinute: parseInt(displayDetail.period.startTime.split(':')[1] || '0'),
          endHour: parseInt(displayDetail.period.endTime.split(':')[0] || '0'),
          endMinute: parseInt(displayDetail.period.endTime.split(':')[1] || '0'),
          label: `${displayDetail.period.startTime} - ${displayDetail.period.endTime}`,
        }
      : null);

  const [period, setPeriod] = useState<DateValue | null>(initialPeriod);
  const [operatingHours, setOperatingHours] = useState<TimeRangeValue | null>(
    initialOperatingHours,
  );
  const [placeName, setPlaceName] = useState(
    (restored.placeName as string) ?? displayDetail?.location?.placeName ?? '',
  );
  const [address, setAddress] = useState(
    (restored.address as string) ?? displayDetail?.location?.placeName ?? '',
  );
  const [latitude, setLatitude] = useState<number | null>(
    (restored.latitude as number) ?? displayDetail?.location?.latitude ?? null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    (restored.longitude as number) ?? displayDetail?.location?.longitude ?? null,
  );
  const [contact, setContact] = useState(
    (restored.contact as string) ?? displayDetail?.qnaAccount ?? '',
  );
  const [notice, setNotice] = useState((restored.notice as string) ?? displayDetail?.note ?? '');

  const [sheet, setSheet] = useState<SheetType>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (displayId > 0 && !state?.displayDetail && fetchedDetail) {
      setPeriod(
        (prev) =>
          (restored.periodValue as DateValue) ??
          (fetchedDetail.period
            ? {
                start: parseDate(fetchedDetail.period.startDate),
                end: parseDate(fetchedDetail.period.endDate),
                label: `${fetchedDetail.period.startDate.split('-').join('.')} - ${fetchedDetail.period.endDate.split('-').join('.')}`,
              }
            : prev),
      );
      setOperatingHours(
        (prev) =>
          (restored.operatingHoursValue as TimeRangeValue) ??
          (fetchedDetail.period
            ? {
                startHour: parseInt(fetchedDetail.period.startTime.split(':')[0] || '0'),
                startMinute: parseInt(fetchedDetail.period.startTime.split(':')[1] || '0'),
                endHour: parseInt(fetchedDetail.period.endTime.split(':')[0] || '0'),
                endMinute: parseInt(fetchedDetail.period.endTime.split(':')[1] || '0'),
                label: `${fetchedDetail.period.startTime} - ${fetchedDetail.period.endTime}`,
              }
            : prev),
      );
      setPlaceName(
        (prev) => (restored.placeName as string) ?? fetchedDetail.location?.placeName ?? prev,
      );
      setAddress(
        (prev) => (restored.address as string) ?? fetchedDetail.location?.placeName ?? prev,
      );
      setLatitude(
        (prev) => (restored.latitude as number) ?? fetchedDetail.location?.latitude ?? prev,
      );
      setLongitude(
        (prev) => (restored.longitude as number) ?? fetchedDetail.location?.longitude ?? prev,
      );
      setContact((prev) => (restored.contact as string) ?? fetchedDetail.qnaAccount ?? prev);
      setNotice((prev) => (restored.notice as string) ?? fetchedDetail.note ?? prev);
    }
  }, [displayId, state, fetchedDetail, restored]);

  /* 문의 방법은 서버에서 qnaAccount로 받는 필수값입니다. */
  /* 운영 시간은 서버에서 openTime·closeTime 필수값으로 받으므로 함께 확인합니다. */
  const canNext = period && operatingHours && placeName.trim() && address.trim() && contact.trim();

  const handleAddressConfirm = (
    fullAddress: string,
    detailAddress: string,
    lat: number,
    lng: number,
  ) => {
    setAddress(fullAddress);
    setLatitude(lat);
    setLongitude(lng);
  };

  const goNext = () => {
    if (displayId > 0) {
      updateDisplay.mutate(
        {
          title: state?.title ?? fetchedDetail?.title ?? '',
          subtitle: state?.subtitle ?? fetchedDetail?.subtitle ?? null,
          description: state?.intro ?? fetchedDetail?.content ?? null,
          type: state?.type ?? fetchedDetail?.displayType ?? 'PERSONAL',
          fields: state?.field ?? fetchedDetail?.displayFields ?? [],
          schoolOrOrganization: state?.school ?? fetchedDetail?.organization ?? '',
          departmentOrClub: state?.department ?? fetchedDetail?.department ?? null,
          placeName,
          precautions: notice || null,
          startDate: period ? formatDate(period.start) : undefined,
          endDate: period ? formatDate(period.end) : undefined,
          openTime: operatingHours
            ? formatTime(operatingHours.startHour, operatingHours.startMinute)
            : undefined,
          closeTime: operatingHours
            ? formatTime(operatingHours.endHour, operatingHours.endMinute)
            : undefined,
          posterImageUrl:
            state?.imageUrls?.[0] ?? fetchedDetail?.images?.[0]?.imageUrl ?? undefined,
        },
        {
          onSuccess: () => navigate(`/exhibition/${displayId}/manage`, { replace: true }),
          onError: () => alert('수정에 실패했습니다.'),
        },
      );
      return;
    }

    navigate('/exhibition/register/artist', {
      state: {
        ...state,
        period: period?.label ?? '',
        /* 뒤로 왔을 때 달력·시간 선택 상태를 그대로 되살리기 위한 원본 값입니다. */
        periodValue: period,
        operatingHoursValue: operatingHours,
        startDate: period ? formatDate(period.start) : null,
        endDate: period ? formatDate(period.end) : null,
        startTime: operatingHours
          ? formatTime(operatingHours.startHour, operatingHours.startMinute)
          : null,
        endTime: operatingHours
          ? formatTime(operatingHours.endHour, operatingHours.endMinute)
          : null,
        openHours: operatingHours?.label ?? '',
        placeName,
        address,
        latitude,
        longitude,
        contact,
        notice,
      },
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">
      <ExhibitionHeader title="전시 기본 정보" />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col px-5">
          {/* 전시기간 · 운영시간 */}
          <div className="flex items-start gap-3 pb-6">
            <div className="flex flex-1 flex-col gap-3">
              <RequiredLabel required>전시기간</RequiredLabel>
              <button
                type="button"
                onClick={() => setSheet('date')}
                className="w-full flex items-center gap-2.5 border-b border-input-border px-3 py-2.5"
              >
                <Calendar className="size-4 shrink-0 text-main" strokeWidth={1} />
                <span
                  className={`typo-body-xs-regular truncate ${
                    period ? 'text-main' : 'text-input-placeholder'
                  }`}
                >
                  {period?.label ?? '날짜선택'}
                </span>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <RequiredLabel required>운영시간</RequiredLabel>
              <button
                type="button"
                onClick={() => setSheet('time')}
                className="w-full flex items-center gap-2.5 border-b border-input-border px-3 py-2.5"
              >
                <Clock className="size-4 shrink-0 text-main" strokeWidth={1} />
                <span
                  className={`typo-body-xs-regular truncate ${
                    operatingHours ? 'text-main' : 'text-input-placeholder'
                  }`}
                >
                  {operatingHours?.label ?? '시간선택'}
                </span>
              </button>
            </div>
          </div>

          {/* 장소명 */}
          <div className="flex flex-col gap-3 pb-5">
            <RequiredLabel required>장소명</RequiredLabel>
            <input
              id="place-name"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="전시명을 입력해주세요"
              className="w-full border-b border-input-border px-3 py-2.5 bg-transparent typo-body-xs-regular text-main outline-none placeholder:text-input-placeholder"
            />
          </div>

          {/* 주소 */}
          <div className="flex flex-col gap-3 pb-5">
            <RequiredLabel required>주소</RequiredLabel>
            <div className="flex items-center gap-3">
              <input
                id="address"
                value={address}
                readOnly
                placeholder="주소를 검색해주세요"
                className="flex-1 border-b border-input-border px-3 py-2.5 bg-transparent typo-body-xs-regular w-full text-main outline-none placeholder:text-input-placeholder"
              />
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="typo-body-xs-bold shrink-0 rounded-lg bg-card px-4 py-2.5 text-main outline outline-1 outline-offset-[-1px] outline-sub600"
              >
                검색
              </button>
            </div>
          </div>

          {/* 문의 방법 */}
          <div className="flex flex-col gap-3 pb-5">
            <RequiredLabel required>문의 방법</RequiredLabel>
            <div className="flex flex-col gap-1.5">
              <input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="문의 계정 또는 연락처를 입력해주세요"
                className="w-full border-b border-input-border px-3 py-2.5 bg-transparent typo-body-xs-regular text-main outline-none placeholder:text-input-placeholder"
              />
              <p className="typo-body-xxs-regular text-faint">@displayu_oo / example@email.com</p>
            </div>
          </div>

          {/* 유의사항 */}
          <div className="flex flex-col gap-3">
            <RequiredLabel>유의사항</RequiredLabel>
            <div className="flex flex-col gap-1.5">
              <div className="flex h-28 w-full flex-col justify-between border-b border-input-border px-3 py-2.5">
                <textarea
                  id="notice"
                  value={notice}
                  onChange={(e) => setNotice(e.target.value.slice(0, 500))}
                  placeholder="관람 전 알아두면 좋은 내용을 입력해주세요"
                  className="typo-body-xs-regular w-full flex-1 resize-none bg-transparent text-main outline-none placeholder:text-input-placeholder"
                />
                <span className="typo-body-xs-regular self-end text-faint">
                  {notice.length}/500
                </span>
              </div>
              <p className="typo-body-xxs-regular text-faint">
                날짜별 운영 시간이 다르거나 예약, 출입 안내가 있다면 이곳에 적어주세요.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomButtonBar>
        <button
          type="button"
          disabled={!canNext || updateDisplay.isPending || isFetchingDetail}
          onClick={goNext}
          className="typo-body-sm-bold inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-dark py-3 text-card disabled:opacity-40"
        >
          {updateDisplay.isPending || isFetchingDetail
            ? '로딩 중'
            : displayId > 0
              ? '저장'
              : '다음'}
        </button>
      </BottomButtonBar>

      <CalenderSheet
        open={sheet === 'date'}
        onClose={() => setSheet(null)}
        value={period}
        onConfirm={setPeriod}
      />
      <TimeSheet
        open={sheet === 'time'}
        onClose={() => setSheet(null)}
        value={operatingHours}
        onConfirm={setOperatingHours}
      />
      <AddressSearchModal
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />
    </div>
  );
}

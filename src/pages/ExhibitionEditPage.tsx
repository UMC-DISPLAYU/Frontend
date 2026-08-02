import { useState } from 'react';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { BottomButtonBar, ErrorView, LoadingView, PageHeader } from '@/components/common';
import { AddressSearchModal } from '@/components/exhibition-basic-info';
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

const formatPeriodLabel = (start: string, end: string) =>
  start && end ? `${start.replaceAll('-', '.')} - ${end.replaceAll('-', '.')}` : '';

/* 전시 상세 응답이 period/location 객체 또는 평평한 필드로 오는 두 형태를 모두 다룹니다. */
type DisplaySource = {
  title?: string;
  qnaAccount?: string;
  note?: string | null;
  precautions?: string | null;
  placeName?: string;
  roadAddress?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  period?: { startDate?: string; endDate?: string; startTime?: string; endTime?: string };
  location?: { placeName?: string };
};

/* 밑줄형 입력 래퍼 */
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

/*
 * 전시 수정 페이지 (임시)
 * 전시 등록의 기본 정보 화면과 동일한 UI에 기존 값 로딩 + PATCH 저장을 붙인 화면입니다.
 * 등록 플로우와 분리해 한 파일에 모아두었습니다.
 */
export function ExhibitionEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { state } = useLocation() as { state: { displayId?: number } | null };

  const displayId = Number(params.displayId ?? state?.displayId ?? 0);
  const { data: display, isLoading, error } = useDisplayDetail(displayId);
  const updateMutation = useUpdateDisplay(displayId);

  // 사용자가 아직 고치지 않은 값은 서버에서 불러온 값을 그대로 보여줍니다.
  const [edited, setEdited] = useState<{
    title?: string;
    period?: DateValue;
    operatingHours?: TimeRangeValue;
    placeName?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    contact?: string;
    notice?: string;
  }>({});

  const [sheet, setSheet] = useState<SheetType>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const patch = (next: Partial<typeof edited>) => setEdited((prev) => ({ ...prev, ...next }));

  // 등록된 전시 데이터에서 기존 값을 채웁니다.
  const source = display as DisplaySource | undefined;
  const startDate = source?.period?.startDate ?? source?.startDate ?? '';
  const endDate = source?.period?.endDate ?? source?.endDate ?? '';
  const startTime = source?.period?.startTime ?? source?.startTime ?? '';
  const endTime = source?.period?.endTime ?? source?.endTime ?? '';

  const title = edited.title ?? source?.title ?? '';
  const placeName = edited.placeName ?? source?.location?.placeName ?? source?.placeName ?? '';
  const address = edited.address ?? source?.roadAddress ?? placeName;
  const contact = edited.contact ?? source?.qnaAccount ?? '';
  const notice = edited.notice ?? source?.note ?? source?.precautions ?? '';

  const periodLabel = edited.period?.label ?? formatPeriodLabel(startDate, endDate);
  const hoursLabel =
    edited.operatingHours?.label ?? (startTime && endTime ? `${startTime} - ${endTime}` : '');

  const canSave = Boolean(title.trim() && placeName.trim() && !updateMutation.isPending);

  const handleAddressConfirm = (
    fullAddress: string,
    _detailAddress: string,
    lat: number,
    lng: number,
  ) => {
    patch({ address: fullAddress, latitude: lat, longitude: lng });
  };

  const save = () => {
    updateMutation.mutate(
      {
        title,
        placeName,
        precautions: notice,
        startDate: edited.period ? formatDate(edited.period.start) : startDate,
        endDate: edited.period ? formatDate(edited.period.end) : endDate,
        openTime: edited.operatingHours
          ? formatTime(edited.operatingHours.startHour, edited.operatingHours.startMinute)
          : startTime,
        closeTime: edited.operatingHours
          ? formatTime(edited.operatingHours.endHour, edited.operatingHours.endMinute)
          : endTime,
      },
      {
        onSuccess: () => navigate(-1),
      },
    );
  };

  if (!displayId) {
    return <ErrorView message="전시 정보를 찾을 수 없습니다." onRetry={() => navigate(-1)} />;
  }

  if (isLoading) {
    return <LoadingView message="전시 정보를 불러오는 중..." />;
  }

  if (error || !display) {
    return (
      <ErrorView
        message={error?.message || '전시 정보를 불러오지 못했습니다.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-96 flex-col bg-page">
      <PageHeader title="전시 정보 수정" onBack={() => navigate(-1)} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3">
        <div className="flex flex-col gap-6">
          {/* 전시명 */}
          <div className="flex flex-col gap-3">
            <Label required>전시명</Label>
            <Underline>
              <input
                id="title"
                value={title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="전시명을 입력해주세요"
                className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
              />
            </Underline>
          </div>

          {/* 전시기간 · 운영시간 */}
          <div className="flex items-start gap-3">
            <div className="flex flex-1 flex-col gap-3">
              <Label required>전시기간</Label>
              <button type="button" onClick={() => setSheet('date')} className="w-full">
                <Underline>
                  <Calendar className="size-4 shrink-0 text-main" strokeWidth={1} />
                  <span
                    className={`typo-body-xs-regular truncate ${
                      periodLabel ? 'text-main' : 'text-input-placeholder'
                    }`}
                  >
                    {periodLabel || '날짜선택'}
                  </span>
                </Underline>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <Label required>운영시간</Label>
              <button type="button" onClick={() => setSheet('time')} className="w-full">
                <Underline>
                  <Clock className="size-4 shrink-0 text-main" strokeWidth={1} />
                  <span
                    className={`typo-body-xs-regular truncate ${
                      hoursLabel ? 'text-main' : 'text-input-placeholder'
                    }`}
                  >
                    {hoursLabel || '시간선택'}
                  </span>
                </Underline>
              </button>
            </div>
          </div>

          {/* 장소명 */}
          <div className="flex flex-col gap-3">
            <Label required>장소명</Label>
            <Underline>
              <input
                id="place-name"
                value={placeName}
                onChange={(e) => patch({ placeName: e.target.value })}
                placeholder="장소명을 입력해주세요"
                className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
              />
            </Underline>
          </div>

          {/* 주소 */}
          <div className="flex flex-col gap-3">
            <Label required>주소</Label>
            <div className="flex items-center gap-3">
              <Underline className="flex-1">
                <MapPin className="size-4 shrink-0 text-input-placeholder" strokeWidth={1} />
                <input
                  id="address"
                  value={address}
                  readOnly
                  placeholder="주소를 검색해주세요"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                />
              </Underline>
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
          <div className="flex flex-col gap-3">
            <Label>문의 방법</Label>
            <div className="flex flex-col gap-1.5">
              <Underline>
                <input
                  id="contact"
                  value={contact}
                  onChange={(e) => patch({ contact: e.target.value })}
                  placeholder="문의 계정 또는 연락처를 입력해주세요"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                />
              </Underline>
              <p className="typo-body-xxs-regular text-faint">@displayu_oo / example@email.com</p>
            </div>
          </div>

          {/* 유의사항 */}
          <div className="flex flex-col gap-3 pb-8">
            <Label>유의사항</Label>
            <div className="flex flex-col gap-1.5">
              <Underline className="items-start">
                <div className="flex h-28 w-full flex-col justify-between">
                  <textarea
                    id="notice"
                    value={notice}
                    onChange={(e) => patch({ notice: e.target.value.slice(0, 500) })}
                    placeholder="관람 전 알아두면 좋은 내용을 입력해주세요"
                    className="typo-body-xs-regular w-full flex-1 resize-none bg-transparent text-main outline-none placeholder:text-input-placeholder"
                  />
                  <span className="typo-body-xs-regular self-end text-faint">
                    {notice.length}/500
                  </span>
                </div>
              </Underline>
              <p className="typo-body-xxs-regular text-faint">
                날짜별 운영 시간이 다르거나 예약, 출입 안내가 있다면 이곳에 적어주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomButtonBar>
        <button
          type="button"
          disabled={!canSave}
          onClick={save}
          className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white disabled:opacity-40"
        >
          {updateMutation.isPending ? '저장 중' : '저장하기'}
        </button>
      </BottomButtonBar>

      <CalenderSheet
        open={sheet === 'date'}
        onClose={() => setSheet(null)}
        value={edited.period ?? null}
        onConfirm={(next) => patch({ period: next })}
      />
      <TimeSheet
        open={sheet === 'time'}
        onClose={() => setSheet(null)}
        value={edited.operatingHours ?? null}
        onConfirm={(next) => patch({ operatingHours: next })}
      />
      <AddressSearchModal
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />
    </div>
  );
}

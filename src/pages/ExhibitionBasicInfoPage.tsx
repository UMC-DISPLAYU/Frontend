import { useState } from 'react';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BottomButtonBar, PageHeader } from '@/components/common';
import { AddressSearchModal } from '@/components/exhibition-basic-info';
import { CalenderSheet } from '@/components/ui/CalenderSheet';
import { TimeSheet, type TimeRangeValue } from '@/components/ui/TimeSheet';

interface DateValue {
  start: Date;
  end: Date;
  label: string;
}

type SheetType = 'date' | 'time' | null;

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

export function ExhibitionBasicInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [period, setPeriod] = useState<DateValue | null>(null);
  const [operatingHours, setOperatingHours] = useState<TimeRangeValue | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [contact, setContact] = useState('');
  const [notice, setNotice] = useState('');

  const [sheet, setSheet] = useState<SheetType>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const canNext = period && placeName.trim() && address.trim();

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
    navigate('/exhibition/artist', {
      state: {
        ...state,
        period: period?.label ?? '',
        startDate: period?.start.toISOString() ?? null,
        endDate: period?.end.toISOString() ?? null,
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
    <div className="mx-auto flex h-dvh w-96 flex-col bg-page">
      <PageHeader title="전시 기본 정보" onBack={() => navigate(-1)} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3">
        <div className="flex flex-col gap-6">
          {/* 전시기간 · 운영시간 */}
          <div className="flex items-start gap-3">
            <div className="flex flex-1 flex-col gap-3">
              <Label required>전시기간</Label>
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
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <Label required>운영시간</Label>
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
            </div>
          </div>

          {/* 장소명 */}
          <div className="flex flex-col gap-3">
            <Label required>장소명</Label>
            <Underline>
              <input
                id="place-name"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="전시명을 입력해주세요"
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
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="문의 계정 또는 연락처를 입력해주세요"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-input-placeholder"
                />
              </Underline>
              <p className="typo-body-xxs-regular text-faint">
                @displayu_oo / example@email.com
              </p>
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
                    onChange={(e) => setNotice(e.target.value.slice(0, 500))}
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
          disabled={!canNext}
          onClick={goNext}
          className="typo-body-sm-bold h-11 w-full rounded-xl bg-dark text-white disabled:opacity-40"
        >
          다음
        </button>
      </BottomButtonBar>

      <CalenderSheet open={sheet === 'date'} onClose={() => setSheet(null)} value={period} onConfirm={setPeriod} />
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

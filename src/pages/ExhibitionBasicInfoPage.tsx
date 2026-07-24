import { useState } from 'react';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BottomButtonBar, PageHeader } from '@/components/common';
import { FormField, InputBox } from '@/components/exhibition-basic-info';
import { CalenderSheet } from '@/components/ui/CalenderSheet';
import { TimeSheet } from '@/components/ui/TimeSheet';

interface TimeValue {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  label: string;
}

interface DateValue {
  start: Date;
  end: Date;
  label: string;
}

type SheetType = 'date' | 'time-start' | 'time-end' | null;

export function ExhibitionBasicInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [period, setPeriod] = useState<DateValue | null>(null);
  const [openStart, setOpenStart] = useState<TimeValue | null>(null);
  const [openEnd, setOpenEnd] = useState<TimeValue | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [notice, setNotice] = useState('');

  const [sheet, setSheet] = useState<SheetType>(null);

  const canNext = period && placeName.trim() && address.trim();

  const goNext = () => {
    navigate('/exhibition/artist', {
      state: {
        ...state,
        period: period?.label ?? '',
        startDate: period?.start.toISOString() ?? null,
        endDate: period?.end.toISOString() ?? null,
        openHours: openStart && openEnd ? `${openStart.label} - ${openEnd.label}` : '',
        placeName,
        address,
        contact,
        notice,
      },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <PageHeader title="전시 기본 정보" onBack={() => navigate(-1)} centered />

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3">
        <div className="flex flex-col gap-6">
          <FormField label="전시기간" required>
            <button type="button" onClick={() => setSheet('date')} className="w-full">
              <InputBox>
                <Calendar className="size-4 shrink-0 text-main" strokeWidth={1} />
                <span className={`typo-body-xs-regular ${period ? 'text-main' : 'text-faint'}`}>
                  {period?.label ?? '날짜선택'}
                </span>
              </InputBox>
            </button>
          </FormField>

          <FormField
            label="운영시간"
            description="날짜별 운영 시간이 다르다면 유의사항에 적어주세요."
          >
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setSheet('time-start')} className="flex-1">
                <InputBox>
                  <Calendar className="size-4 shrink-0 text-main" strokeWidth={1} />
                  <span className={`typo-body-xs-regular ${openStart ? 'text-main' : 'text-faint'}`}>
                    {openStart?.label ?? '시작 시간'}
                  </span>
                </InputBox>
              </button>
              <button type="button" onClick={() => setSheet('time-end')} className="flex-1">
                <InputBox>
                  <Clock className="size-4 shrink-0 text-main" strokeWidth={1} />
                  <span className={`typo-body-xs-regular ${openEnd ? 'text-main' : 'text-faint'}`}>
                    {openEnd?.label ?? '종료시간'}
                  </span>
                </InputBox>
              </button>
            </div>
          </FormField>

          <FormField label="장소명" required htmlFor="place-name">
            <InputBox>
              <input
                id="place-name"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="전시명을 입력해주세요"
                className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-faint"
              />
            </InputBox>
          </FormField>

          <FormField label="주소" required htmlFor="address">
            <div className="flex items-stretch gap-3">
              <InputBox className="flex-1">
                <MapPin className="size-4 shrink-0 text-faint" strokeWidth={1} />
                <input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="주소를 검색해주세요"
                  className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-faint"
                />
              </InputBox>
              <button
                type="button"
                className="w-14 typo-body-xs-bold rounded-lg bg-card px-3 py-2.5 outline outline-1 outline-offset-[-1px] outline-sub600 shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)]"
              >
                검색
              </button>
            </div>
          </FormField>

          <FormField
            label="문의 방법"
            description="@displayu_oo / example@email.com"
            htmlFor="contact"
          >
            <InputBox>
              <input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="문의 계정 또는 연락처를 입력해주세요"
                className="typo-body-xs-regular w-full bg-transparent text-main outline-none placeholder:text-faint"
              />
            </InputBox>
          </FormField>

          <FormField
            label="유의사항"
            description="날짜별 운영 시간이 다르거나 예약, 출입 안내가 있다면 이곳에 적어주세요."
            htmlFor="notice"
          >
            <InputBox className="items-start">
              <div className="flex h-28 w-full flex-col justify-between">
                <textarea
                  id="notice"
                  value={notice}
                  onChange={(e) => setNotice(e.target.value.slice(0, 500))}
                  placeholder="관람 전 알아두면 좋은 내용을 입력해주세요"
                  className="typo-body-xs-regular w-full flex-1 resize-none bg-transparent text-main outline-none placeholder:text-faint"
                />
                <span className="typo-body-xs-regular self-end text-faint">{notice.length}/500</span>
              </div>
            </InputBox>
          </FormField>
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
        open={sheet === 'time-start'}
        onClose={() => setSheet(null)}
        value={openStart}
        subtitle="시작 시간"
        onConfirm={setOpenStart}
      />
      <TimeSheet
        open={sheet === 'time-end'}
        onClose={() => setSheet(null)}
        value={openEnd}
        subtitle="종료 시간"
        onConfirm={setOpenEnd}
      />
    </div>
  );
}

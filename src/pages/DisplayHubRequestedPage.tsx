import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  DISPLAY_HUB_BOTTOM_BAR_CLASS,
  DisplayHubDoneRing,
  DisplayPublishSteps,
  getDisplayHubButtonClass,
} from '@/components/display-hub';
import { PageContainer } from '@/components/layout';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';

// 완료 모션은 프로토타입(flow.css `.done`)과 같다: 링 → 체크 → 제목 · 설명 → 단계 · 요약 → 버튼 순서로 한 번만
const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const riseStyle = (duration: number, delay: number): CSSProperties => ({
  animation: `display-hub-done-up ${duration}ms ${delay}ms ${EASE} both`,
});

export function DisplayHubRequestedPage() {
  const { displayId } = useParams();
  const { data: display } = useDisplayDetail(Number(displayId));

  const rows = [
    { label: '전시명', value: display?.title ?? '' },
    { label: '상태', value: '심사 중' },
    { label: '공개 방식', value: '승인된 시점부터 자동 공개' },
  ];

  return (
    // 프로토타입은 넓은 화면에서도 콘텐츠 양옆이 흰색이라 페이지 전체를 흰 배경으로 감싼다
    <div className="min-h-dvh bg-primary-white">
      <PageContainer
        variant="form"
        className="typography-body-lg-medium max-w-[480px] text-primary desktop:max-w-list"
      >
        <main className="flex flex-1 flex-col">
          <div className="pt-14 text-center">
            <DisplayHubDoneRing />
            <h1 className="typography-title-xs mt-5" style={riseStyle(500, 300)}>
              등록을 요청했어요
            </h1>
            <p
              className="typography-body-lg-regular mt-2 whitespace-pre-line text-secondary"
              style={riseStyle(500, 360)}
            >
              {'승인된 시점부터 관람객에게 자동으로 공개돼요\n심사 중에도 내용을 수정할 수 있어요'}
            </p>
          </div>

          <div className="mt-8" style={riseStyle(550, 440)}>
            <DisplayPublishSteps current={3} />
          </div>

          <dl
            className="mt-8 grid gap-5 rounded-12 bg-secondary px-5 py-6"
            style={riseStyle(550, 440)}
          >
            {rows.map((row, index) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4"
                style={riseStyle(450, 500 + index * 50)}
              >
                <dt className="typography-body-lg-medium text-secondary">{row.label}</dt>
                <dd className="typography-body-lg-semibold text-right text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
          {/* 프로토타입은 dl 기본 아래 여백(14px)에 안내 문구 위 여백 16px 이 더해져 30px 이 된다 */}
          <p className="typography-body-md-medium mt-[30px] text-center text-tertiary">
            승인 결과는 알림으로 알려드릴 예정이에요
          </p>

          <div className={DISPLAY_HUB_BOTTOM_BAR_CLASS} style={riseStyle(500, 620)}>
            <Link to="/display-management" replace className={getDisplayHubButtonClass('primary')}>
              내 전시 관리로 이동
            </Link>
          </div>
        </main>
      </PageContainer>
    </div>
  );
}

import { useEffect, useRef } from 'react';

import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

import { FullSheet } from './FullSheet';
import { getArtworkRegisterPath } from './receivedInvitation';

const CHECK_LENGTH = 28;

const ACTION_CLASS =
  'typography-body-lg-semibold grid h-12 place-items-center rounded-12 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99';

export type JoinCompleteSummary = {
  displayId: number;
  title: string;
  organization: string;
  /** 예: 2026.11.12 – 11.18 */
  period: string;
  artistName: string;
};

interface JoinCompleteSheetProps {
  open: boolean;
  onClose: () => void;
  summary: JoinCompleteSummary | null;
}

/** 모션 토큰(semantic.css)을 Web Animations API 에서 쓰도록 읽는다 */
const readMotionTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const toMs = (name: string) => parseFloat(style.getPropertyValue(name));
  return {
    base: toMs('--semantic-motion-duration-base'),
    slow: toMs('--semantic-motion-duration-slow'),
    stagger: toMs('--semantic-motion-stagger'),
    easing: style.getPropertyValue('--semantic-motion-easing-standard').trim(),
  };
};

export function JoinCompleteSheet({ open, onClose, summary }: JoinCompleteSheetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLSpanElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const summaryRef = useRef<HTMLDListElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  /* 프로토타입 등장 효과: 원이 커지며 퍼지고, 체크가 그려진 뒤 제목 · 요약 · 버튼이 차례로 올라온다 */
  useEffect(() => {
    if (!open) return;
    /* Web Animations API 는 index.css 의 동작 줄이기 전역 규칙이 적용되지 않아 직접 확인한다 */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { base, slow, stagger, easing } = readMotionTokens();
    const enter = { duration: slow, easing, fill: 'backwards' } as const;
    const rise = [{ transform: 'translateY(12px)', opacity: 0 }, {}];
    const rows = Array.from(summaryRef.current?.children ?? []);

    const animations = [
      ringRef.current?.animate([{ transform: 'scale(0.72)', opacity: 0 }, {}], enter),
      haloRef.current?.animate(
        [
          { transform: 'scale(1)', opacity: 0.22 },
          { transform: 'scale(1.75)', opacity: 0 },
        ],
        { ...enter, duration: slow * 2, delay: stagger * 3 },
      ),
      checkRef.current?.animate([{ strokeDashoffset: CHECK_LENGTH }, { strokeDashoffset: 0 }], {
        ...enter,
        delay: base,
      }),
      titleRef.current?.animate(rise, { ...enter, delay: base }),
      subtitleRef.current?.animate(rise, { ...enter, delay: base + stagger }),
      summaryRef.current?.animate(rise, { ...enter, delay: base + stagger * 2 }),
      ...rows.map((row, index) =>
        row.animate(rise, { ...enter, delay: base + stagger * (3 + index) }),
      ),
      actionsRef.current?.animate(rise, { ...enter, delay: base + stagger * 5 }),
    ];

    return () => animations.forEach((animation) => animation?.cancel());
  }, [open]);

  const rows = summary
    ? [
        { label: '전시명', value: summary.title },
        { label: '소속', value: summary.organization },
        { label: '기간', value: summary.period },
        { label: '역할', value: '팀원' },
        { label: '전시 작가명', value: summary.artistName },
      ]
    : [];

  return (
    <FullSheet initialFocusRef={titleRef} label="전시 참여 완료" onClose={onClose} open={open}>
      {() => (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex flex-1 flex-col justify-center pb-10">
            <div
              aria-hidden="true"
              className="relative mx-auto grid size-16 place-items-center rounded-circle bg-interactive-primary text-icon-white"
              ref={ringRef}
            >
              <span
                className="absolute inset-0 -z-1 rounded-circle bg-interactive-primary opacity-0"
                ref={haloRef}
              />
              <svg
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.4}
                viewBox="0 0 24 24"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" ref={checkRef} strokeDasharray={CHECK_LENGTH} />
              </svg>
            </div>
            <h2
              className="typography-title-xs mt-2.5 text-center text-primary outline-none"
              ref={titleRef}
              tabIndex={-1}
            >
              전시 참여가 완료되었어요
            </h2>
            <p
              className="typography-body-lg-regular mt-1 text-center text-secondary"
              ref={subtitleRef}
            >
              이제 이 전시가 내 전시 관리에 추가돼요
            </p>
            <dl className="mt-8 grid gap-5 rounded-12 bg-secondary px-5 py-6" ref={summaryRef}>
              {rows.map(({ label, value }) => (
                <div className="flex items-baseline justify-between gap-4" key={label}>
                  <dt className="typography-body-lg-regular shrink-0 text-secondary">{label}</dt>
                  <dd className="typography-body-lg-semibold min-w-0 flex-1 text-right text-primary">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {/* 시트가 쌓은 오버레이 기록 위에 쌓이지 않게 다른 화면으로는 replace 로 이동한다 */}
          <div className="grid gap-2 py-3" ref={actionsRef}>
            <Link
              className={cn(
                ACTION_CLASS,
                'bg-interactive-primary text-interactive-inverse hover:bg-interactive-primary-hover',
              )}
              replace
              to={summary ? getArtworkRegisterPath(summary.displayId) : '/display-management'}
            >
              내 작품 등록하기
            </Link>
            <Link
              className={cn(ACTION_CLASS, 'bg-secondary text-primary hover:bg-tertiary')}
              replace
              to="/display-management"
            >
              내 전시 관리로 이동
            </Link>
          </div>
        </div>
      )}
    </FullSheet>
  );
}

import { useEffect, useRef } from 'react';

import { focusOnMount } from './focusOnMount';
import { OnboardingBottomButton } from './OnboardingBottomButton';

const CHECK_LENGTH = 26;

/** 모션 토큰(semantic.css)을 Web Animations API 에서 쓰도록 읽는다. */
const readMotionTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const toMs = (name: string) => parseFloat(style.getPropertyValue(name));
  return {
    base: toMs('--semantic-motion-duration-base'),
    slow: toMs('--semantic-motion-duration-slow'),
    easing: style.getPropertyValue('--semantic-motion-easing-standard').trim(),
  };
};

export function SignupCompleteScreen({ onNext }: { onNext: () => void }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  /* 프로토타입 등장 효과: 원이 커지며 나타나고, 잠시 뒤 체크가 그려지며 제목이 올라온다 */
  useEffect(() => {
    /* Web Animations API 는 index.css 의 동작 줄이기 전역 규칙이 적용되지 않아 직접 확인한다 */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { base, slow, easing } = readMotionTokens();
    const enter = { duration: slow, easing, fill: 'backwards' } as const;
    const animations = [
      ringRef.current?.animate([{ transform: 'scale(0.72)', opacity: 0 }, {}], enter),
      checkRef.current?.animate([{ strokeDashoffset: CHECK_LENGTH }, { strokeDashoffset: 0 }], {
        ...enter,
        delay: base,
      }),
      titleRef.current?.animate([{ transform: 'translateY(12px)', opacity: 0 }, {}], {
        ...enter,
        delay: base,
      }),
    ];

    return () => animations.forEach((animation) => animation?.cancel());
  }, []);

  const setTitleRef = (element: HTMLHeadingElement | null) => {
    titleRef.current = element;
    focusOnMount(element);
  };

  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center pb-12 text-center">
        <div
          ref={ringRef}
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-circle bg-interactive-primary text-icon-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
          >
            <path ref={checkRef} d="m5 12.5 4.5 4.5L19 7.5" strokeDasharray={CHECK_LENGTH} />
          </svg>
        </div>
        <h1
          ref={setTitleRef}
          tabIndex={-1}
          className="typography-title-xs mt-3 text-primary outline-none"
        >
          가입이 완료되었어요
        </h1>
      </main>

      <OnboardingBottomButton onClick={onNext}>이용하기</OnboardingBottomButton>
    </>
  );
}

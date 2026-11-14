import './artistVerify.css';

import type { ReactNode } from 'react';

import { PageContainer } from '@/components/layout';

import { PROTOTYPE_FONT } from './artistVerifyStyles';

/**
 * 프로토타입처럼 화면 전체(양옆 포함)를 흰 배경으로 두고, 기본 글씨 Pretendard Variable 500 14px / 1.4 · 자간 -3%를 깐다.
 * 자간은 em 값이라 상속하면 부모 글씨 크기로 고정되므로 모든 자식에 다시 건다.
 * 폭: 768px 미만 최대 480px, 이상 672px(PageContainer form).
 */
export function ArtistVerifyLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${PROTOTYPE_FONT} min-h-dvh bg-[#fff] text-[14px] leading-[1.4] font-medium tracking-[-0.03em] text-[#18181b] [&_*]:tracking-[-0.03em]`}
    >
      <PageContainer className="max-w-[480px]" variant="form">
        {children}
      </PageContainer>
    </div>
  );
}

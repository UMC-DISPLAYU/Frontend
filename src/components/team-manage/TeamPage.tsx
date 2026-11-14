import type { ReactNode } from 'react';

import { PageContainer } from '@/components/layout';

/*
 * 프로토타입 .page: 폰은 최대 480, 태블릿부터 672 가운데 정렬. 위 여백은 max(8px, safe area) → 태블릿 40.
 * 자간은 프로토타입처럼 요소마다 자기 글씨 크기의 -3%로 계산되게 모든 자식에 준다.
 * 프로토타입은 누를 수 있는 버튼에 손가락 커서를 쓰는데 Tailwind 기본은 화살표라 페이지 안 버튼에 준다.
 * 바깥(body)이 회색이라 넓은 화면에서도 양옆이 흰색이도록 전체 폭을 흰 바탕으로 감싼다.
 */
export function TeamPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#fff]">
      <PageContainer
        variant="form"
        className="max-w-[480px] pt-[max(8px,env(safe-area-inset-top))] text-[14px] leading-[1.4] font-medium tracking-[-0.03em] text-[#18181b] tablet:pt-10 [&_*]:tracking-[-0.03em] [&_button:enabled]:cursor-pointer"
      >
        {children}
      </PageContainer>
    </div>
  );
}

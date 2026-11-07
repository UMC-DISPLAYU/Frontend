import type { ComponentProps } from 'react';

import { BottomButton } from '@/components/common';

/** 온보딩 화면은 흰 배경이라, 공용 하단 버튼의 감싸는 영역 배경을 맞춘다. */
export function OnboardingBottomButton(
  props: Omit<ComponentProps<typeof BottomButton>, 'inPageContainer' | 'wrapperClassName'>,
) {
  return <BottomButton inPageContainer wrapperClassName="bg-primary-white" {...props} />;
}

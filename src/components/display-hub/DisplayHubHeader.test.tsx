import { isValidElement, type ReactElement } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { DisplayHubHeader } from './DisplayHubHeader';

vi.mock('react-router-dom', () => ({ Link: 'a' }));

type Element = ReactElement<Record<string, unknown>>;

describe('전시 관리 헤더', () => {
  it('뒤로가기는 기록을 되돌리지 않고 정해진 화면으로 간다', () => {
    const header = DisplayHubHeader({
      title: '전시 관리',
      backTo: '/display-management',
      backLabel: '내 전시 관리로 돌아가기',
    }) as Element;
    const [back] = header.props.children as Element[];

    expect(isValidElement(back)).toBe(true);
    expect(back.props.to).toBe('/display-management');
    expect(back.props['aria-label']).toBe('내 전시 관리로 돌아가기');
    expect(back.props.onClick).toBeUndefined();
  });
});

import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';

import { ExhibitionWorkLayout } from './ExhibitionWorkLayout';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), focus: vi.fn() }));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useId: () => 'work-tabs',
}));
vi.mock('react-router-dom', () => ({ Link: 'a', useNavigate: () => mocks.navigate }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/components/common/OptimizedImage', () => ({ OptimizedImage: 'img' }));
vi.mock('@/components/layout', () => ({ PageContainer: 'main' }));

const display = {
  displayId: 7,
  title: '전시',
  status: 'UPCOMING',
  period: { startDate: '2026-11-01', endDate: '2026-11-30' },
  images: [],
  location: { placeName: '전시장' },
} as unknown as DisplayDetailDto;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('document', { getElementById: vi.fn(() => ({ focus: mocks.focus })) });
});
afterEach(() => vi.unstubAllGlobals());

describe('전시 작업 탭', () => {
  it('선택한 패널과 키보드 포커스를 함께 전환한다', () => {
    const changeTab = vi.fn();
    const page = ExhibitionWorkLayout({
      display,
      activeTab: 'artworks',
      onTabChange: changeTab,
      children: null,
    });
    const tabs = page.props.children[2].props.children as ReactElement[];
    expect(tabs.map((tab) => tab.props.tabIndex)).toEqual([0, -1]);
    const preventDefault = vi.fn();
    tabs[0].props.onKeyDown({ key: 'ArrowRight', preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(changeTab).toHaveBeenLastCalledWith('contents');
    expect(document.getElementById).toHaveBeenCalledWith('work-tabs-contents');
    expect(mocks.focus).toHaveBeenCalledOnce();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('기존 별도 관리 경로에서 탭을 누르면 전시 작업의 해당 탭으로 이동한다', () => {
    const page = ExhibitionWorkLayout({ display, activeTab: 'contents', children: null });
    page.props.children[2].props.children[0].props.onClick();
    expect(mocks.navigate).toHaveBeenCalledWith('/exhibition/7/work?tab=artworks', {
      replace: true,
    });
  });
});

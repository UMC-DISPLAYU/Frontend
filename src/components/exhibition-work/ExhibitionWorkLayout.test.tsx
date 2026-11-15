import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';
import { DisplaySummaryCard } from '@/components/common/DisplaySummaryCard';

import { ExhibitionWorkLayout } from './ExhibitionWorkLayout';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), focus: vi.fn(), userId: 1 }));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useId: () => 'work-tabs',
}));
vi.mock('react-router-dom', () => ({ Link: 'a', useNavigate: () => mocks.navigate }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/hooks/queries/useUserProfile', () => ({
  useUserMe: () => ({ data: { id: mocks.userId } }),
}));
vi.mock('@/components/layout', () => ({ PageContainer: 'main' }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const tabsOf = (page: ReactNode) =>
  nodes(page).find((node) => node.props.role === 'tablist')!.props.children as Element[];

const display = {
  displayId: 7,
  title: '전시',
  status: 'UPCOMING',
  period: { startDate: '2026-11-01', endDate: '2026-11-30' },
  ownerUserId: 1,
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
    const tabs = tabsOf(page);
    expect(tabs.map((tab) => tab.props.tabIndex)).toEqual([0, -1]);
    const preventDefault = vi.fn();
    (tabs[0].props.onKeyDown as (event: unknown) => void)({ key: 'ArrowRight', preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(changeTab).toHaveBeenLastCalledWith('contents');
    expect(document.getElementById).toHaveBeenCalledWith('work-tabs-contents');
    expect(mocks.focus).toHaveBeenCalledOnce();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('기존 별도 관리 경로에서 탭을 누르면 전시 작업의 해당 탭으로 이동한다', () => {
    const page = ExhibitionWorkLayout({ display, activeTab: 'contents', children: null });
    (tabsOf(page)[0].props.onClick as () => void)();
    expect(mocks.navigate).toHaveBeenCalledWith('/exhibition/7/work?tab=artworks', {
      replace: true,
    });
  });
});

describe('전시 요약 카드', () => {
  it('공용 전시 요약 카드에 전시를 넘긴다', () => {
    const page = ExhibitionWorkLayout({ display, activeTab: 'artworks', children: null });
    const card = nodes(page).find((node) => node.type === DisplaySummaryCard);
    expect(card?.props.display).toBe(display);
  });
});

describe('전시 상태', () => {
  const statusLabelOf = (status: string) =>
    nodes(
      ExhibitionWorkLayout({
        display: { ...display, status },
        activeTab: 'artworks',
        children: null,
      }),
    ).find((node) => node.type === DisplaySummaryCard);

  it.each(['DRAFT', 'PENDING_REVIEW', 'REJECTED', 'PUBLISHED'])(
    '공개 상태 %s 는 요약 카드에 그대로 넘긴다',
    (status) => {
      const card = statusLabelOf(status);
      expect(card?.props.status).toBe(status);
      expect(card?.props.statusLabel).toBeUndefined();
    },
  );

  it('모르는 값(전시 기간 상태)은 한글 라벨을 준비 중 모양으로 보인다', () => {
    const card = statusLabelOf('UPCOMING');
    expect(card?.props.status).toBe('DRAFT');
    expect(card?.props.statusLabel).toBe('전시 예정');
  });
});

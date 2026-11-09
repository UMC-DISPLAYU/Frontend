import { renderToStaticMarkup } from 'react-dom/server';

import { beforeEach, expect, it, vi } from 'vitest';

import type { ExhibitionItem } from '@/types/mypage';

import { DisplayManagementCard } from './DisplayManagementCard';

const h = vi.hoisted(() => ({
  members: undefined as { members: { userId: number; displayNickname: string }[] } | undefined,
  useDisplayMembers: vi.fn(),
}));

vi.mock('@/hooks/queries/useUserProfile', () => ({
  useUserMe: () => ({ data: { id: 1, isVerified: true } }),
}));
vi.mock('@/hooks/queries/useDisplayMembers', () => ({
  useDisplayMembers: h.useDisplayMembers,
}));

const display: ExhibitionItem = {
  id: '10',
  displayId: 10,
  isOwner: true,
  isLeader: true,
  status: '전시 중',
  title: 'FORM 2026',
  org: '중앙대학교 디자인학부',
  period: '2026.06.10 – 2026.06.20',
  startDate: '2026-06-10',
  endDate: '2026-06-20',
  place: '301호 2층 아트홀',
  thumbnail: 'https://example.com/poster.png',
  artistName: '전시작가',
};

const render = (ex: ExhibitionItem) =>
  renderToStaticMarkup(
    <DisplayManagementCard
      ex={ex}
      onOpen={vi.fn()}
      onDelete={vi.fn()}
      onLeave={vi.fn()}
      onEditArtistName={vi.fn()}
    />,
  );

beforeEach(() => {
  h.members = undefined;
  h.useDisplayMembers.mockReset();
  h.useDisplayMembers.mockImplementation(() => ({ data: h.members }));
});

it('상태, 역할, 전시 정보를 표시한다', () => {
  const html = render(display);

  expect(html).toContain('공개 중');
  expect(html).toContain('· 대표자(전시작가)');
  expect(html).toContain('FORM 2026');
  expect(html).toContain('2026.06.10 - 06.20');
  expect(html).toContain('301호 2층 아트홀');
  expect(html).toContain('FORM 2026 메뉴');
});

it.each([
  ['DRAFT', '준비 중'],
  ['PENDING_REVIEW', '심사 중'],
  ['REJECTED', '반려'],
] as const)('발행 상태가 %s이면 날짜 상태 대신 %s(으)로 표시한다', (publishStatus, label) => {
  const html = render({ ...display, publishStatus });

  expect(html).toContain(label);
  expect(html).not.toContain('공개 중');
});

it.each([
  ['PENDING_REVIEW', 'text-info'],
  ['REJECTED', 'text-error'],
] as const)('발행 상태가 %s이면 %s 색으로 표시한다', (publishStatus, colorClass) => {
  expect(render({ ...display, publishStatus })).toContain(colorClass);
});

it('발행된 전시는 날짜 기준 상태를 표시한다', () => {
  expect(render({ ...display, publishStatus: 'PUBLISHED' })).toContain('공개 중');
  expect(render({ ...display, publishStatus: 'PUBLISHED', status: '전시 종료' })).toContain(
    '전시 종료',
  );
});

it('전시 작가명이 응답에 있으면 멤버 목록을 조회하지 않는다', () => {
  render(display);

  expect(h.useDisplayMembers).toHaveBeenCalledWith(0);
});

it('전시 작가명이 응답에 없으면 멤버 목록에서 내 이름을 찾는다', () => {
  h.members = { members: [{ userId: 1, displayNickname: '멤버작가' }] };

  const html = render({ ...display, isOwner: false, isLeader: false, artistName: undefined });

  expect(h.useDisplayMembers).toHaveBeenCalledWith(10);
  expect(html).toContain('· 팀원(멤버작가)');
});

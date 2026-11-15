import { renderToStaticMarkup } from 'react-dom/server';

import { beforeEach, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';
import type { Work } from '@/types/artworkManage';

import { ManageScreen } from './ManageScreen';

const h = vi.hoisted(() => ({ user: { id: 1, isVerified: true } }));
vi.mock('@/hooks/queries/useUserProfile', () => ({ useUserMe: () => ({ data: h.user }) }));

const display = {
  ownerUserId: 1,
  teamMembers: [
    { userId: 2, accepted: true },
    { userId: 3, accepted: true },
  ],
} as DisplayDetailDto;
const works: Work[] = [
  {
    id: 10,
    title: '대표 작품',
    artist: '작가',
    artistUserId: 2,
    artistUserIds: [2, 3],
    org: '',
    date: '',
    place: '',
    owner: '',
  },
  {
    id: 20,
    title: '다른 작품',
    artist: '작가',
    artistUserId: 4,
    org: '',
    date: '',
    place: '',
    owner: '',
  },
];

beforeEach(() => {
  h.user = { id: 1, isVerified: true };
});

// 전시 대표자는 팀원의 작품도 수정 · 삭제할 수 있다(프로토타입 · Swagger · 권한 매트릭스)
it.each([
  [1, true, true, true, true, true],
  [1, false, false, false, false, false],
  [2, true, true, false, true, false],
  [3, true, true, false, true, false],
  [2, false, false, false, false, false],
  [9, true, false, false, false, false],
] as const)(
  '사용자 %i·인증 %s의 생성·정렬·작품 관리 권한',
  (id, verified, create, reorder, manage, manageOthers) => {
    h.user = { id, isVerified: verified };
    const html = renderToStaticMarkup(
      <ManageScreen
        works={works}
        display={display}
        userId={id}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onEditOrder={vi.fn()}
        onAdd={vi.fn()}
      />,
    );
    expect(html.includes('전시작 추가')).toBe(create);
    expect(html.includes('순서 편집')).toBe(reorder);
    expect(html.includes('대표 작품 작품 관리')).toBe(manage);
    expect(html.includes('다른 작품 작품 관리')).toBe(manageOthers);
  },
);

it.each([
  [49, true],
  [50, false],
])('전시작 %i개일 때 전시작 추가 버튼 노출 %s', (count, visible) => {
  const many: Work[] = Array.from({ length: count }, (_, index) => ({
    ...works[1],
    id: index + 100,
    title: `작품 ${index}`,
  }));
  const html = renderToStaticMarkup(
    <ManageScreen
      works={many}
      display={display}
      userId={1}
      onOpen={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onEditOrder={vi.fn()}
      onAdd={vi.fn()}
    />,
  );
  expect(html.includes('전시작 추가')).toBe(visible);
});

// 작품 목록의 artistUserIds 에는 대표 · 공동 작가가 모두 들어 있어 공동 작가에게도 내 작품으로 보인다
it.each([
  [2, 1],
  [3, 1],
  [9, 0],
] as const)('사용자 %i 에게 보이는 내 작품 칩 %i개', (id, count) => {
  h.user = { id, isVerified: true };
  const html = renderToStaticMarkup(
    <ManageScreen
      works={works}
      display={display}
      userId={id}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onEditOrder={vi.fn()}
      onAdd={vi.fn()}
    />,
  );
  expect(html.split('내 작품').length - 1).toBe(count);
});

it('대표 작가 계정이 없어도 계정이 있는 공동 작가는 자기 작품을 관리할 수 있다', () => {
  h.user = { id: 3, isVerified: true };
  const html = renderToStaticMarkup(
    <ManageScreen
      works={[{ ...works[0], artistUserId: null, artistUserIds: [3] }]}
      display={display}
      userId={3}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onEditOrder={vi.fn()}
      onAdd={vi.fn()}
    />,
  );
  expect(html.includes('대표 작품 작품 관리')).toBe(true);
});

it('작가 계정이 하나도 없는 작품도 전시 대표자는 관리할 수 있다', () => {
  h.user = { id: 1, isVerified: true };
  const html = renderToStaticMarkup(
    <ManageScreen
      works={[{ ...works[0], artistUserId: null, artistUserIds: [] }]}
      display={display}
      userId={1}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onEditOrder={vi.fn()}
      onAdd={vi.fn()}
    />,
  );
  expect(html.includes('대표 작품 작품 관리')).toBe(true);
});

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
    coAuthorUserIds: [3],
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

it.each([
  [1, true, true, true, false],
  [2, true, true, false, true],
  [3, true, true, false, true],
  [2, false, false, false, false],
  [9, true, false, false, false],
] as const)(
  '사용자 %i·인증 %s의 기존 생성·정렬·작품 관리 권한을 유지한다',
  (id, verified, create, reorder, manage) => {
    h.user = { id, isVerified: verified };
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
    expect(html.includes('전시작 추가')).toBe(create);
    expect(html.includes('순서 편집')).toBe(reorder);
    expect(html.includes('대표 작품 작품 관리')).toBe(manage);
    expect(html.includes('다른 작품 작품 관리')).toBe(false);
  },
);

import { renderToStaticMarkup } from 'react-dom/server';

import { expect, it, vi } from 'vitest';

import type { Work } from '@/types/artworkManage';

import { OrderScreen } from './OrderScreen';
import { moveItem, moveItemByKey } from './useLiveSort';

vi.mock('@/components/common/OptimizedImage', () => ({ OptimizedImage: () => null }));

const works: Work[] = [1, 2, 3].map((id) => ({
  id,
  title: `작품 ${id}`,
  artist: '작가',
  org: '',
  date: '',
  place: '',
  owner: '',
}));
const ids = (items: Work[] | null) => items?.map((work) => work.id);

it.each([
  ['뒤 카드 위로 끌면 그 자리로', 1, 3, [2, 3, 1]],
  ['앞 카드 위로 끌면 그 자리로', 3, 1, [3, 1, 2]],
  ['옆 카드와 자리를 바꾼다', 2, 3, [1, 3, 2]],
] as const)('%s 옮긴다(프로토타입 sortable)', (_, dragged, over, expected) => {
  expect(ids(moveItem(works, dragged, over))).toEqual(expected);
  expect(ids(works)).toEqual([1, 2, 3]);
});

it.each([
  [1, 1],
  [9, 1],
  [1, 9],
])('끄는 카드 %i를 %i 위에 두어도 바뀌지 않으면 같은 배열을 돌려준다', (dragged, over) => {
  expect(moveItem(works, dragged, over)).toBe(works);
});

it.each([
  ['ArrowRight', 1, [2, 1, 3]],
  ['ArrowDown', 2, [1, 3, 2]],
  ['ArrowLeft', 3, [1, 3, 2]],
  ['ArrowUp', 2, [2, 1, 3]],
] as const)('방향키 %s로 작품 %i를 한 칸 옮긴다', (key, id, expected) => {
  expect(ids(moveItemByKey(works, id, key))).toEqual(expected);
});

it.each([
  ['ArrowLeft', 1],
  ['ArrowRight', 3],
  ['Enter', 2],
])('끝에서 더 가거나(%s · %i) 방향키가 아니면 옮기지 않는다', (key, id) => {
  expect(moveItemByKey(works, id, key)).toBeNull();
});

it('순서 편집은 카드마다 번호를 보이고 카드 전체를 끌 수 있게 한다', () => {
  const html = renderToStaticMarkup(
    <OrderScreen works={works} onReorder={vi.fn()} onDone={vi.fn()} />,
  );
  expect(html).toContain('끌어서 순서를 바꾸면 자동으로 저장돼요');
  expect(html.match(/data-sort-id="\d"/g)).toEqual([
    'data-sort-id="1"',
    'data-sort-id="2"',
    'data-sort-id="3"',
  ]);
  expect(html).toContain('aria-label="2번째, 작품 2"');
});

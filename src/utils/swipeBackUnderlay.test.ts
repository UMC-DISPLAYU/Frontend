import { describe, expect, it } from 'vitest';

import { createHistorySnapshots } from './swipeBackUnderlay';

describe('createHistorySnapshots', () => {
  it('저장한 순번으로 꺼낸다', () => {
    const snapshots = createHistorySnapshots<string>(3);
    snapshots.save(2, 'list');

    expect(snapshots.get(2)).toBe('list');
    expect(snapshots.get(1)).toBeUndefined();
  });

  it('같은 순번에서 다시 떠나면 새 모습으로 바꾼다', () => {
    const snapshots = createHistorySnapshots<string>(3);
    snapshots.save(2, 'old');
    snapshots.save(2, 'new');

    expect(snapshots.get(2)).toBe('new');
  });

  it('뒤로 갔다가 다시 앞으로 이동하면 버려진 앞쪽 순번을 지운다', () => {
    const snapshots = createHistorySnapshots<string>(5);
    snapshots.save(1, 'a');
    snapshots.save(2, 'b');
    snapshots.save(3, 'c');
    // 순번 2 로 돌아간 뒤 순번 1 에서 다른 곳으로 이동
    snapshots.save(1, 'a2');

    expect(snapshots.get(1)).toBe('a2');
    expect(snapshots.get(2)).toBeUndefined();
    expect(snapshots.get(3)).toBeUndefined();
  });

  it('limit 개까지만 남기고 오래된 순번부터 지운다', () => {
    const snapshots = createHistorySnapshots<number>(3);
    for (let idx = 0; idx <= 4; idx += 1) snapshots.save(idx, idx);

    expect(snapshots.get(1)).toBeUndefined();
    expect([2, 3, 4].map((idx) => snapshots.get(idx))).toEqual([2, 3, 4]);
  });
});

import { describe, expect, it } from 'vitest';

import { pickArtworkFiles } from './useArtworkImageUploads';

const MB = 1024 * 1024;
const jpg = (name: string, size = MB) => ({ name, type: 'image/jpeg', size });
const gif = (name: string) => ({ name, type: 'image/gif', size: MB });

describe('pickArtworkFiles', () => {
  it('남은 칸만큼 고른 순서대로 넣고, 칸이 다 찬 뒤 남은 파일이 있으면 overLimit', () => {
    const result = pickArtworkFiles([jpg('a'), jpg('b'), jpg('c')], 8, 10);

    expect(result.accepted.map((file) => file.name)).toEqual(['a', 'b']);
    expect(result.overLimit).toBe(true);
    expect(result.rejectedCount).toBe(0);
  });

  it('마지막 칸을 정확히 채우면 overLimit 이 아니다', () => {
    const result = pickArtworkFiles([jpg('a'), jpg('b')], 8, 10);

    expect(result.accepted).toHaveLength(2);
    expect(result.overLimit).toBe(false);
  });

  it('올릴 수 없는 파일은 건너뛰고 장수에 세지 않는다', () => {
    const result = pickArtworkFiles([gif('x'), jpg('a', 21 * MB), jpg('b')], 9, 10);

    expect(result.accepted.map((file) => file.name)).toEqual(['b']);
    expect(result.rejectedCount).toBe(2);
    expect(result.overLimit).toBe(false);
  });

  it('장당 20MB 는 올리고 넘으면 올리지 않는다', () => {
    const result = pickArtworkFiles([jpg('a', 20 * MB), jpg('b', 20 * MB + 1)], 0, 10);

    expect(result.accepted.map((file) => file.name)).toEqual(['a']);
    expect(result.rejectedCount).toBe(1);
  });

  it('이미 가득 차 있으면 아무것도 넣지 않는다', () => {
    const result = pickArtworkFiles([jpg('a')], 10, 10);

    expect(result.accepted).toHaveLength(0);
    expect(result.overLimit).toBe(true);
  });
});

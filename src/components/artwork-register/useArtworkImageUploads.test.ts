import { describe, expect, it } from 'vitest';

import { pickArtworkFiles } from './useArtworkImageUploads';

const MB = 1024 * 1024;
const jpg = (name: string, size = MB) => ({ name, type: 'image/jpeg', size });
const gif = (name: string) => ({ name, type: 'image/gif', size: MB });
const mp4 = (name: string, size = MB) => ({ name, type: 'video/mp4', size });

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

  it('HEIC · HEIF 는 받고, 윈도우처럼 형식이 비어 있어도 확장자로 받는다', () => {
    const result = pickArtworkFiles(
      [
        { name: 'a.heic', type: 'image/heic', size: MB },
        { name: 'b.heif', type: 'image/heif', size: MB },
        { name: 'c.HEIC', type: '', size: MB },
        { name: 'd', type: '', size: MB },
      ],
      0,
      10,
    );

    expect(result.accepted.map((file) => file.name)).toEqual(['a.heic', 'b.heif', 'c.HEIC']);
    expect(result.rejectedCount).toBe(1);
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

  it('영상을 받는 칸은 영상 1개까지 넣는다', () => {
    const result = pickArtworkFiles([mp4('v1'), mp4('v2')], 0, 10, { allowVideo: true });

    expect(result.accepted.map((file) => file.name)).toEqual(['v1']);
    expect(result.message).toBe('영상은 1개만 올릴 수 있어요');
  });

  it('영상은 500MB(10진 바이트) 이하만 넣는다', () => {
    expect(
      pickArtworkFiles([mp4('v', 500_000_000)], 0, 10, { allowVideo: true }).accepted,
    ).toHaveLength(1);
    expect(pickArtworkFiles([mp4('v', 500_000_001)], 0, 10, { allowVideo: true })).toMatchObject({
      accepted: [],
      message: '영상은 500MB 이하로 올려주세요',
    });
  });

  it('이미 영상이 있으면 영상은 넣지 않는다', () => {
    const result = pickArtworkFiles([mp4('v'), jpg('a')], 1, 10, {
      allowVideo: true,
      currentVideoCount: 1,
    });

    expect(result.accepted.map((file) => file.name)).toEqual(['a']);
    expect(result.message).toBe('영상은 1개만 올릴 수 있어요');
  });

  it('영상을 받지 않는 칸은 안내가 있으면 안내로, 없으면 올릴 수 없는 파일로 센다', () => {
    expect(
      pickArtworkFiles([mp4('v')], 0, 10, {
        videoNotAllowedMessage: '작업 과정에는 사진만 올릴 수 있어요',
      }),
    ).toMatchObject({
      accepted: [],
      rejectedCount: 0,
      message: '작업 과정에는 사진만 올릴 수 있어요',
    });
    expect(pickArtworkFiles([mp4('v')], 0, 10)).toMatchObject({ accepted: [], rejectedCount: 1 });
  });
});

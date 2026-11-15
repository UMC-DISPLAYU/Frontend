import { describe, expect, it } from 'vitest';

import { formatVideoDuration } from './videoFile';
import { canUploadAsIs } from './videoTranscode';

describe('canUploadAsIs', () => {
  it('H.264 MP4 는 소리가 없거나 AAC 면 그대로 올린다', () => {
    expect(canUploadAsIs({ isMp4: true, videoCodec: 'avc', audioCodec: null })).toBe(true);
    expect(canUploadAsIs({ isMp4: true, videoCodec: 'avc', audioCodec: 'aac' })).toBe(true);
  });

  it('MOV · HEVC · VP9 · AAC 가 아닌 소리는 바꿔서 올린다', () => {
    expect(canUploadAsIs({ isMp4: false, videoCodec: 'avc', audioCodec: 'aac' })).toBe(false);
    expect(canUploadAsIs({ isMp4: true, videoCodec: 'hevc', audioCodec: 'aac' })).toBe(false);
    expect(canUploadAsIs({ isMp4: false, videoCodec: 'vp9', audioCodec: 'opus' })).toBe(false);
    expect(canUploadAsIs({ isMp4: true, videoCodec: 'avc', audioCodec: 'opus' })).toBe(false);
  });
});

describe('formatVideoDuration', () => {
  it('초를 m:ss 로 바꾸고 소수점은 버린다', () => {
    expect(formatVideoDuration(0)).toBe('0:00');
    expect(formatVideoDuration(16.9)).toBe('0:16');
    expect(formatVideoDuration(30)).toBe('0:30');
    expect(formatVideoDuration(180)).toBe('3:00');
  });
});

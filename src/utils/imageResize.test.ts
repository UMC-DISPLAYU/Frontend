import { describe, expect, it } from 'vitest';

import { getResizedImageSize, MAX_UPLOAD_IMAGE_EDGE, toJpegFileName } from './imageResize';

describe('getResizedImageSize', () => {
  it('긴 변이 정확히 3,200px 이면 줄이지 않는다', () => {
    expect(MAX_UPLOAD_IMAGE_EDGE).toBe(3200);
    expect(getResizedImageSize({ width: 3200, height: 2400 })).toBeNull();
    expect(getResizedImageSize({ width: 2400, height: 3200 })).toBeNull();
    expect(getResizedImageSize({ width: 3200, height: 3200 })).toBeNull();
  });

  it('긴 변이 3,201px 이면 긴 변을 3,200px 로 줄인다', () => {
    expect(getResizedImageSize({ width: 3201, height: 2000 })).toEqual({
      width: 3200,
      height: 1999,
    });
    expect(getResizedImageSize({ width: 3201, height: 3201 })).toEqual({
      width: 3200,
      height: 3200,
    });
  });

  it('세로로 긴 사진은 세로를 3,200px 로 맞추고 비율을 지킨다', () => {
    expect(getResizedImageSize({ width: 2000, height: 3201 })).toEqual({
      width: 1999,
      height: 3200,
    });
    expect(getResizedImageSize({ width: 4000, height: 6000 })).toEqual({
      width: 2133,
      height: 3200,
    });
    expect(getResizedImageSize({ width: 3024, height: 4032 })).toEqual({
      width: 2400,
      height: 3200,
    });
  });

  it('가로로 긴 사진은 가로를 3,200px 로 맞춘다', () => {
    expect(getResizedImageSize({ width: 6000, height: 4000 })).toEqual({
      width: 3200,
      height: 2133,
    });
  });

  it('아주 가는 사진도 짧은 변이 1px 아래로 내려가지 않는다', () => {
    expect(getResizedImageSize({ width: 20000, height: 2 })).toEqual({ width: 3200, height: 1 });
  });

  it('기준 긴 변을 바꿔 쓸 수 있다', () => {
    expect(getResizedImageSize({ width: 200, height: 100 }, 100)).toEqual({
      width: 100,
      height: 50,
    });
  });
});

describe('toJpegFileName', () => {
  it('확장자를 .jpg 로 바꾼다', () => {
    expect(toJpegFileName('poster.png')).toBe('poster.jpg');
    expect(toJpegFileName('IMG_0001.HEIC')).toBe('IMG_0001.jpg');
    expect(toJpegFileName('my.photo.webp')).toBe('my.photo.jpg');
    expect(toJpegFileName('photo.jpeg')).toBe('photo.jpg');
  });

  it('확장자가 없으면 .jpg 를 붙인다', () => {
    expect(toJpegFileName('photo')).toBe('photo.jpg');
  });
});

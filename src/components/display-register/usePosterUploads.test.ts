import { describe, expect, it } from 'vitest';

import {
  needsPosterMeasure,
  type PosterFitState,
  type PosterItem,
  toInitialPosterItem,
  toPosterImageInfo,
  toRepresentativePosterFit,
} from './usePosterUploads';

const NO_FIT: PosterFitState = { crop: null, fit: null, edgeColor: null };
const image = (url: string) => ({ url, mediaType: 'IMAGE' as const, thumbnailUrl: null });
const video = (url: string) => ({ url, mediaType: 'VIDEO' as const, thumbnailUrl: `${url}.jpg` });

describe('toRepresentativePosterFit', () => {
  it('대표가 영상이면 FILL 을 보낸다', () => {
    const item = toInitialPosterItem(video('v.mp4'), 0, NO_FIT, undefined);
    expect(toRepresentativePosterFit(item)).toBe('FILL');
  });

  it('대표가 사진이면 그 사진의 보이는 방식, 포스터가 없으면 null', () => {
    const item = toInitialPosterItem(image('a.png'), 0, { ...NO_FIT, fit: 'FIT' }, undefined);
    expect(toRepresentativePosterFit(item)).toBe('FIT');
    expect(toRepresentativePosterFit(undefined)).toBeNull();
  });
});

describe('toInitialPosterItem', () => {
  it('대표가 아닌 포스터는 올릴 때 잰 보이는 방식 · 가장자리 색을 되살리고 다시 재지 않는다', () => {
    const item = toInitialPosterItem(image('b.png'), 1, NO_FIT, {
      width: 800,
      height: 800,
      fit: 'FIT',
      edgeColor: '#2a6f97',
    });

    expect(item).toMatchObject({ fit: 'FIT', edgeColor: '#2a6f97', measured: true });
    expect(needsPosterMeasure(item)).toBe(false);
  });

  it('잰 크기만 있으면 사진 비율로 보이는 방식을 채운다', () => {
    const item = toInitialPosterItem(image('b.png'), 1, NO_FIT, { width: 1200, height: 800 });
    expect(item.fit).toBe('FIT');
  });

  it('대표 포스터는 draft(서버) 값을 먼저 쓴다', () => {
    const item = toInitialPosterItem(
      image('a.png'),
      0,
      { crop: null, fit: 'FILL', edgeColor: '#112233' },
      { fit: 'FIT', edgeColor: '#445566' },
    );
    expect(item).toMatchObject({ fit: 'FILL', edgeColor: '#112233' });
  });
});

describe('needsPosterMeasure', () => {
  it('잰 정보가 없는 저장된 포스터가 대표가 되면 잰다', () => {
    const item = toInitialPosterItem(image('b.png'), 1, NO_FIT, undefined);
    expect(needsPosterMeasure(item)).toBe(true);
  });

  it('저장된 대표 포스터에 보이는 방식이 있어도 가장자리 색이 없으면 잰다', () => {
    const item = toInitialPosterItem(image('a.png'), 0, { ...NO_FIT, fit: 'FILL' }, undefined);
    expect(needsPosterMeasure(item)).toBe(true);
  });

  it('보이는 방식 · 색이 다 있거나, 이미 재 봤거나, 영상이면 재지 않는다', () => {
    const saved = toInitialPosterItem(
      image('a.png'),
      0,
      { crop: null, fit: 'FIT', edgeColor: '#112233' },
      undefined,
    );
    const tried: PosterItem = { ...saved, edgeColor: null, measured: true };
    const videoItem = toInitialPosterItem(video('v.mp4'), 0, NO_FIT, undefined);

    expect(needsPosterMeasure(saved)).toBe(false);
    expect(needsPosterMeasure(tried)).toBe(false);
    expect(needsPosterMeasure(videoItem)).toBe(false);
  });
});

describe('toPosterImageInfo', () => {
  it('잰 사진만 올라간 주소로 남긴다', () => {
    const items: PosterItem[] = [
      {
        id: '1',
        mediaType: 'IMAGE',
        previewUrl: 'blob:1',
        uploadedUrl: 'https://x/a.png',
        width: 800,
        height: 800,
        fit: 'FIT',
        edgeColor: '#2a6f97',
        measured: true,
      },
      { id: '2', mediaType: 'IMAGE', previewUrl: 'blob:2', measured: true },
      { id: '3', mediaType: 'VIDEO', previewUrl: 'blob:3', uploadedUrl: 'https://x/v.mp4' },
    ];

    expect(toPosterImageInfo(items)).toEqual({
      'https://x/a.png': { width: 800, height: 800, fit: 'FIT', edgeColor: '#2a6f97' },
    });
  });
});

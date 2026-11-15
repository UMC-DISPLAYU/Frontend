import { describe, expect, it } from 'vitest';

import { toArtworkFieldLabels, toArtworkTypes } from './artworkRegister.constants';
import {
  artworkRegisterSchema,
  type ArtworkRegisterValues,
  sanitizeArtworkYearInput,
} from './artworkRegister.schema';

const valid: ArtworkRegisterValues = {
  title: '머문 자리의 온기',
  intro: '',
  fieldLabels: ['회화'],
  year: '2026',
  material: '아크릴, 캔버스',
  size: '',
};

const firstMessage = (values: Partial<ArtworkRegisterValues>) => {
  const result = artworkRegisterSchema.safeParse({ ...valid, ...values });
  return result.success ? null : result.error.issues[0]?.message;
};

describe('artworkRegisterSchema', () => {
  it('필수 값이 모두 있으면 통과하고 앞뒤 공백을 지운다', () => {
    const result = artworkRegisterSchema.parse({ ...valid, title: '  제목  ', size: ' 90 cm ' });

    expect(result.title).toBe('제목');
    expect(result.size).toBe('90 cm');
  });

  it('작품명이 공백뿐이면 막는다', () => {
    expect(firstMessage({ title: '   ' })).toBe('작품명을 입력해주세요.');
  });

  it('재료 / 매체는 선택이라 비워도 된다', () => {
    expect(firstMessage({ material: '' })).toBeNull();
    expect(firstMessage({ material: ' ' })).toBeNull();
  });

  it('작품분야는 1개 이상 3개 이하만 받는다', () => {
    expect(firstMessage({ fieldLabels: [] })).toBe('작품분야를 선택해주세요.');
    expect(firstMessage({ fieldLabels: ['회화', '조소', '사진'] })).toBeNull();
    expect(firstMessage({ fieldLabels: ['회화', '조소', '사진', '영상'] })).toBe(
      '작품분야는 최대 3개까지 선택할 수 있어요.',
    );
    expect(firstMessage({ fieldLabels: ['없는 분야'] })).not.toBeNull();
  });

  it.each([
    ['999', false],
    ['0999', false],
    ['1000', true],
    ['2026', true],
    ['20261', false],
    ['20a6', false],
  ])('제작 연도 %s → 통과 %s', (year, passes) => {
    expect(artworkRegisterSchema.safeParse({ ...valid, year }).success).toBe(passes);
  });

  it('최대 글자 수를 넘으면 막는다', () => {
    expect(firstMessage({ title: 'a'.repeat(60) })).toBeNull();
    expect(firstMessage({ title: 'a'.repeat(61) })).toBe('작품명은 60자까지 입력할 수 있어요.');
    expect(firstMessage({ intro: 'a'.repeat(1501) })).toBe(
      '작품 설명은 1500자까지 입력할 수 있어요.',
    );
    expect(firstMessage({ material: 'a'.repeat(41) })).toBe(
      '재료 / 매체는 40자까지 입력할 수 있어요.',
    );
  });
});

describe('sanitizeArtworkYearInput', () => {
  it('숫자만 남기고 4자리로 자른다', () => {
    expect(sanitizeArtworkYearInput('20a2-6 7')).toBe('2026');
  });
});

describe('작품분야 변환', () => {
  it('전시 작품은 12개 분야를 신규 서버 값으로 하나씩 보낸다', () => {
    expect(toArtworkTypes(['그래픽', '브랜딩', '제품'])).toEqual([
      'GRAPHIC',
      'BRANDING',
      'PRODUCT',
    ]);
    expect(toArtworkTypes(['공간', 'UXUI', '영상'])).toEqual(['SPACE', 'UX_UI', 'VIDEO']);
    expect(toArtworkTypes(['공예', '기타'])).toEqual(['CRAFTS', 'OTHERS']);
  });

  it('개인 작품은 개인 작품 API 값으로 보내고, 같은 값으로 가는 분야는 한 번만 보낸다', () => {
    expect(toArtworkTypes(['그래픽', '브랜딩'], 'personal')).toEqual(['DESIGN']);
    expect(toArtworkTypes(['회화', '영상', '공예'], 'personal')).toEqual([
      'PAINTING',
      'MEDIA',
      'CRAFT',
    ]);
    expect(toArtworkTypes(['기타'], 'personal')).toEqual(['ETC']);
  });

  it('서버 값을 분야 이름으로 되돌리고, 12개 밖의 값은 버린다', () => {
    expect(toArtworkFieldLabels(['BRANDING', 'UX_UI', 'CRAFTS'])).toEqual([
      '브랜딩',
      'UXUI',
      '공예',
    ]);
    expect(toArtworkFieldLabels(['VIDEO', 'OTHERS'])).toEqual(['영상', '기타']);
    expect(toArtworkFieldLabels(['PAINTING', 'DESIGN'])).toEqual(['회화']);
    expect(toArtworkFieldLabels(['FASHION', 'MEDIA', 'ETC'])).toEqual([]);
  });
});

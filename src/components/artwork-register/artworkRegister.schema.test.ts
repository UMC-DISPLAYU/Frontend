import { describe, expect, it } from 'vitest';

import {
  exceedsArtworkFieldLimit,
  toArtworkFieldLabels,
  toArtworkTypes,
} from './artworkRegister.constants';
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

  it('작품명 · 재료 / 매체가 공백뿐이면 막는다', () => {
    expect(firstMessage({ title: '   ' })).toBe('작품명을 입력해주세요.');
    expect(firstMessage({ material: ' ' })).toBe('재료 / 매체를 입력해주세요.');
  });

  it('작품분야는 1개 이상 2개 이하만 받는다', () => {
    expect(firstMessage({ fieldLabels: [] })).toBe('작품분야를 선택해주세요.');
    expect(firstMessage({ fieldLabels: ['회화', '조소'] })).toBeNull();
    expect(firstMessage({ fieldLabels: ['회화', '조소', '사진'] })).toBe(
      '작품분야는 최대 2개까지 선택할 수 있어요.',
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
  it('같은 서버 값으로 가는 분야는 한 번만 보낸다', () => {
    expect(toArtworkTypes(['그래픽', '브랜딩'])).toEqual(['DESIGN']);
    expect(toArtworkTypes(['회화', '영상'])).toEqual(['PAINTING', 'MEDIA']);
  });

  it('서버 값을 분야 이름으로 되돌리고, 화면에 없는 값은 기타로 본다', () => {
    expect(toArtworkFieldLabels(['PAINTING', 'DESIGN'])).toEqual(['회화', '그래픽']);
    expect(toArtworkFieldLabels(['FASHION', 'COMPLEX'])).toEqual(['기타']);
    expect(toArtworkFieldLabels(['PAINTING', 'SCULPTURE', 'MEDIA'])).toEqual(['회화', '조소']);
  });
});

describe('작품분야 개수 한도', () => {
  it('분야 이름 2개 · 서버 값 2개까지는 넘지 않는다', () => {
    expect(exceedsArtworkFieldLimit(['회화', '조소'])).toBe(false);
    expect(exceedsArtworkFieldLimit(['회화', '조소', '사진'])).toBe(true);
  });

  it('기타가 화면에 없는 서버 분야 2개를 대신하면 다른 분야를 더 고를 수 없다', () => {
    expect(exceedsArtworkFieldLimit(['기타'], ['FASHION', 'COMPLEX'])).toBe(false);
    expect(exceedsArtworkFieldLimit(['기타', '회화'], ['FASHION', 'COMPLEX'])).toBe(true);
    expect(exceedsArtworkFieldLimit(['기타', '회화'], ['FASHION'])).toBe(false);
  });
});

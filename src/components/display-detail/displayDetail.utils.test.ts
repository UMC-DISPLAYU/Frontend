import { describe, expect, it } from 'vitest';

import {
  formatPeriodDate,
  formatPeriodTime,
  getDisplayDetailTabs,
  getDisplayIntroText,
  hasDisplayIntro,
  hasDisplayWorks,
  toInstagramLink,
  toWebsiteLink,
} from './displayDetail.utils';

describe('소개 탭 표시', () => {
  const category = { categoryId: 1 };
  const works = { hasWorks: true };

  it('소개 글이나 전시 콘텐츠 중 하나라도 있으면 소개 탭을 둔다', () => {
    expect(hasDisplayIntro({ content: '소개', contentCategories: [] })).toBe(true);
    expect(hasDisplayIntro({ content: null, contentCategories: [category] })).toBe(true);
    expect(getDisplayDetailTabs({ content: '소개', contentCategories: [] }, works)).toEqual([
      'intro',
      'works',
      'reviews',
    ]);
  });

  it('소개 글이 비었거나 공백뿐이고 콘텐츠도 없으면 소개 탭을 빼 작품 탭이 처음이 된다', () => {
    for (const content of [null, undefined, '', ' \n\t ']) {
      expect(hasDisplayIntro({ content, contentCategories: [] })).toBe(false);
      expect(getDisplayDetailTabs({ content, contentCategories: [] }, works)).toEqual([
        'works',
        'reviews',
      ]);
    }
  });

  it('소개 글은 앞뒤 공백을 뺀 글을 보인다', () => {
    expect(getDisplayIntroText({ content: '  소개 글\n' })).toBe('소개 글');
    expect(getDisplayIntroText({ content: null })).toBe('');
  });
});

describe('작품 탭 표시', () => {
  it('작품 목록을 받기 전 · 불러오기 실패(응답 없음)는 작품 탭을 남긴다', () => {
    expect(hasDisplayWorks(undefined)).toBe(true);
  });

  it('작품이 하나라도 있으면 작품 탭을 둔다', () => {
    expect(hasDisplayWorks({ artworks: [{ artworkId: 1 }] })).toBe(true);
  });

  it('받은 목록이 비었으면(작품 공개 전 포함) 작품 탭을 뺀다', () => {
    for (const artworks of [[], null, undefined]) {
      expect(hasDisplayWorks({ artworks })).toBe(false);
    }
  });

  it('작품만 없으면 소개 · 후기, 소개도 없으면 후기만 남는다(후기는 쓰는 탭이라 늘 남긴다)', () => {
    const intro = { content: '소개', contentCategories: [] };
    const empty = { content: ' ', contentCategories: [] };
    expect(getDisplayDetailTabs(intro, { hasWorks: false })).toEqual(['intro', 'reviews']);
    expect(getDisplayDetailTabs(empty, { hasWorks: false })).toEqual(['reviews']);
  });
});

describe('formatPeriodDate', () => {
  it('같은 해면 끝 날짜의 연도를 뺀다', () => {
    expect(formatPeriodDate('2026-10-12', '2026-11-20')).toBe('2026.10.12 - 11.20');
  });

  it('해가 바뀌면 끝 날짜에도 연도를 붙인다', () => {
    expect(formatPeriodDate('2026-12-28', '2027-01-03')).toBe('2026.12.28 - 2027.01.03');
  });

  it('하루짜리이거나 끝 날짜가 없으면 시작 날짜만 보인다', () => {
    expect(formatPeriodDate('2026-10-12', '2026-10-12')).toBe('2026.10.12');
    expect(formatPeriodDate('2026-10-12', null)).toBe('2026.10.12');
    expect(formatPeriodDate(null, '2026-10-12')).toBe('');
  });
});

describe('formatPeriodTime', () => {
  it('초를 뺀다', () => {
    expect(formatPeriodTime('10:00:00', '18:00:00')).toBe('10:00 - 18:00');
    expect(formatPeriodTime('10:00', undefined)).toBe('');
  });
});

describe('toInstagramLink', () => {
  it('아이디 · @아이디 · 주소를 모두 아이디로 바꾼다', () => {
    const expected = { label: '@unfold_2026', href: 'https://www.instagram.com/unfold_2026/' };
    expect(toInstagramLink('unfold_2026')).toEqual(expected);
    expect(toInstagramLink('@unfold_2026')).toEqual(expected);
    expect(toInstagramLink('https://www.instagram.com/unfold_2026/?hl=ko')).toEqual(expected);
  });

  it('비어 있으면 없다', () => {
    expect(toInstagramLink('  ')).toBeNull();
    expect(toInstagramLink(null)).toBeNull();
  });
});

describe('toWebsiteLink', () => {
  it('https 를 붙이고 보이는 글자에서는 https · www · 끝 / 를 뺀다', () => {
    expect(toWebsiteLink('www.unfold.kr/')).toEqual({
      label: 'unfold.kr',
      href: 'https://www.unfold.kr/',
    });
    expect(toWebsiteLink('http://unfold.kr/about')).toEqual({
      label: 'unfold.kr/about',
      href: 'http://unfold.kr/about',
    });
  });

  it('http(s)가 아닌 주소나 잘못된 값은 열지 않는다', () => {
    expect(toWebsiteLink('javascript:alert(1)')).toBeNull();
    expect(toWebsiteLink('')).toBeNull();
  });
});

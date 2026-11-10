import { describe, expect, it } from 'vitest';

import { parseInstagramId, parseWebsiteUrl } from './displayLinks';

describe('parseInstagramId', () => {
  it('비어 있으면 empty', () => {
    expect(parseInstagramId('  ')).toEqual({ status: 'empty' });
  });

  it('@ 와 instagram 주소를 아이디로 바꾼다', () => {
    expect(parseInstagramId('@displayu')).toMatchObject({ status: 'valid', value: 'displayu' });
    expect(parseInstagramId('https://www.instagram.com/display.u_26/')).toMatchObject({
      status: 'valid',
      value: 'display.u_26',
      href: 'https://instagram.com/display.u_26',
    });
  });

  it('허용하지 않는 문자 · 마침표로 끝나는 아이디 · 30자 초과는 invalid', () => {
    expect(parseInstagramId('display u')).toEqual({ status: 'invalid' });
    expect(parseInstagramId('displayu.')).toEqual({ status: 'invalid' });
    expect(parseInstagramId('a'.repeat(31))).toEqual({ status: 'invalid' });
    expect(parseInstagramId('a'.repeat(30))).toMatchObject({ status: 'valid' });
  });
});

describe('parseWebsiteUrl', () => {
  it('비어 있으면 empty', () => {
    expect(parseWebsiteUrl('')).toEqual({ status: 'empty' });
  });

  it('프로토콜이 없으면 https 를 붙인다', () => {
    expect(parseWebsiteUrl('displayu.kr')).toEqual({
      status: 'valid',
      value: 'displayu.kr',
      href: 'https://displayu.kr/',
    });
  });

  it('경로와 쿼리를 유지하고 끝 슬래시는 뺀다', () => {
    expect(parseWebsiteUrl('http://www.displayu.kr/works/?a=1')).toMatchObject({
      status: 'valid',
      value: 'www.displayu.kr/works?a=1',
    });
  });

  it('도메인이 아니거나 공백이 있으면 invalid', () => {
    expect(parseWebsiteUrl('displayu')).toEqual({ status: 'invalid' });
    expect(parseWebsiteUrl('display u.kr')).toEqual({ status: 'invalid' });
    expect(parseWebsiteUrl('localhost:3000')).toEqual({ status: 'invalid' });
  });
});

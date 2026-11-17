import { describe, expect, it } from 'vitest';

import { linkifyText } from './linkify';

describe('linkifyText', () => {
  it('주소가 없으면 글 그대로 한 조각이다', () => {
    expect(linkifyText('좋은 전시였어요')).toEqual([{ type: 'text', text: '좋은 전시였어요' }]);
  });

  it('http · https 주소를 링크로 나눈다', () => {
    expect(linkifyText('여기 https://displayu.co.kr/display/1 보세요')).toEqual([
      { type: 'text', text: '여기 ' },
      {
        type: 'link',
        text: 'https://displayu.co.kr/display/1',
        href: 'https://displayu.co.kr/display/1',
      },
      { type: 'text', text: ' 보세요' },
    ]);
  });

  it('www. 로 시작하는 주소는 https 로 연다', () => {
    expect(linkifyText('www.instagram.com/displayu')).toEqual([
      {
        type: 'link',
        text: 'www.instagram.com/displayu',
        href: 'https://www.instagram.com/displayu',
      },
    ]);
  });

  it('주소 뒤에 붙은 문장 부호는 링크에서 뺀다', () => {
    expect(linkifyText('(http://a.com/x).')).toEqual([
      { type: 'text', text: '(' },
      { type: 'link', text: 'http://a.com/x', href: 'http://a.com/x' },
      { type: 'text', text: ').' },
    ]);
  });

  it('주소 안에서 짝이 맞는 괄호는 링크에 남긴다', () => {
    expect(linkifyText('https://ko.wikipedia.org/wiki/Art_(visual) 참고')).toEqual([
      {
        type: 'link',
        text: 'https://ko.wikipedia.org/wiki/Art_(visual)',
        href: 'https://ko.wikipedia.org/wiki/Art_(visual)',
      },
      { type: 'text', text: ' 참고' },
    ]);
    expect(linkifyText('(https://a.com/Art_(visual)).')).toEqual([
      { type: 'text', text: '(' },
      { type: 'link', text: 'https://a.com/Art_(visual)', href: 'https://a.com/Art_(visual)' },
      { type: 'text', text: ').' },
    ]);
  });

  it('줄바꿈과 여러 주소를 그대로 둔다', () => {
    expect(linkifyText('a http://a.com\nb https://b.com')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'link', text: 'http://a.com', href: 'http://a.com' },
      { type: 'text', text: '\nb ' },
      { type: 'link', text: 'https://b.com', href: 'https://b.com' },
    ]);
  });

  it('주소 없이 접두어만 있거나 javascript: 같은 주소는 링크로 만들지 않는다', () => {
    expect(linkifyText('https:// 끝')).toEqual([{ type: 'text', text: 'https:// 끝' }]);
    expect(linkifyText('javascript:alert(1)')).toEqual([
      { type: 'text', text: 'javascript:alert(1)' },
    ]);
  });
});

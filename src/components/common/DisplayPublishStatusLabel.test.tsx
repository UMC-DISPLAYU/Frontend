import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { DisplayPublishStatusLabel } from './DisplayPublishStatusLabel';

describe('DisplayPublishStatusLabel', () => {
  it.each([
    ['PENDING_REVIEW', '심사 중', 'bg-[#3b82f6]', 'text-[#2563eb]'],
    ['REJECTED', '반려', 'bg-[#fb2c36]', 'text-[#fb2c36]'],
    ['PUBLISHED', '공개 중', 'bg-[#00c758]', 'text-[#00a846]'],
  ] as const)('%s 는 "%s", 점 %s · 글자 %s(프로토타입 .st)', (status, label, dot, text) => {
    const html = renderToStaticMarkup(<DisplayPublishStatusLabel status={status} />);

    expect(html).toContain(label);
    expect(html).toContain(dot);
    expect(html).toContain(text);
    expect(html).toContain('size-2');
    expect(html).toContain('typography-body-md-semibold');
  });

  it('준비 중은 글자색 클래스를 넣지 않아 놓인 자리의 글자색을 따른다', () => {
    const html = renderToStaticMarkup(<DisplayPublishStatusLabel status="DRAFT" />);

    expect(html).toContain('준비 중');
    expect(html).toContain('bg-[#27272a]');
    expect(html).not.toMatch(/text-\[#|text-(primary|secondary)/);
  });

  it('label 을 주면 문구만 바꾸고 색은 status 를 따른다', () => {
    const html = renderToStaticMarkup(
      <DisplayPublishStatusLabel status="DRAFT" label="전시 예정" />,
    );

    expect(html).toContain('전시 예정');
    expect(html).not.toContain('준비 중');
    expect(html).toContain('bg-[#27272a]');
  });

  it('className 으로 바깥 클래스를 더한다', () => {
    expect(
      renderToStaticMarkup(<DisplayPublishStatusLabel status="PUBLISHED" className="shrink-0" />),
    ).toContain('shrink-0');
  });
});

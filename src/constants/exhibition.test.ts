import { describe, expect, it } from 'vitest';

import { toDisplayFieldValue } from './exhibition';

describe('toDisplayFieldValue', () => {
  it.each([
    ['CRAFT', 'CRAFTS'],
    ['ETC', 'OTHERS'],
    ['MEDIA', 'VIDEO'],
    ['UXUI', 'UX_UI'],
    ['GRAPHIC', 'GRAPHIC'],
    ['DESIGN', 'DESIGN'],
  ])('%s 는 %s 로 본다', (code, expected) => {
    expect(toDisplayFieldValue(code)).toBe(expected);
  });
});

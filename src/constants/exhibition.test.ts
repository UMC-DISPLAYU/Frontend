import { describe, expect, it } from 'vitest';

import { DISPLAY_FIELD_MAP, DISPLAY_FIELD_SERVER_VALUES, EXHIBITION_FIELDS } from './exhibition';

describe('DISPLAY_FIELD_MAP', () => {
  it('모든 분야를 서버 enum 값으로 바꾼다', () => {
    EXHIBITION_FIELDS.forEach((field) => {
      expect(DISPLAY_FIELD_SERVER_VALUES).toContain(DISPLAY_FIELD_MAP[field]);
    });
  });

  it('영상은 VIDEO, 일러스트는 ILLUSTRATION 으로 보낸다', () => {
    expect(DISPLAY_FIELD_MAP.VIDEO).toBe('VIDEO');
    expect(DISPLAY_FIELD_MAP.ILLUSTRATION).toBe('ILLUSTRATION');
  });
});

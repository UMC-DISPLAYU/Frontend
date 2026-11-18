import { describe, expect, it } from 'vitest';

import { hasPersistedTokenChanged } from './persistedAuth';

const persisted = (accessToken: unknown) => JSON.stringify({ state: { accessToken }, version: 1 });

describe('hasPersistedTokenChanged', () => {
  it('저장소에만 토큰이 있으면(다른 페이지에서 로그인) 바뀐 것으로 본다', () => {
    expect(hasPersistedTokenChanged(persisted('new-token'), null)).toBe(true);
  });

  it('저장소 토큰이 메모리와 다르면 바뀐 것으로 본다', () => {
    expect(hasPersistedTokenChanged(persisted('new-token'), 'old-token')).toBe(true);
  });

  it('저장소 토큰이 메모리와 같으면 그대로 둔다', () => {
    expect(hasPersistedTokenChanged(persisted('same-token'), 'same-token')).toBe(false);
  });

  it('둘 다 토큰이 없으면(로그인 취소 후 복귀) 그대로 둔다', () => {
    expect(hasPersistedTokenChanged(persisted(null), null)).toBe(false);
    expect(hasPersistedTokenChanged(null, null)).toBe(false);
  });

  it('메모리에만 토큰이 있으면(다른 페이지에서 로그아웃) 바뀐 것으로 본다', () => {
    expect(hasPersistedTokenChanged(persisted(null), 'old-token')).toBe(true);
    expect(hasPersistedTokenChanged(null, 'old-token')).toBe(true);
  });

  it('토큰이 문자열이 아니거나 state 가 없으면 토큰 없음으로 본다', () => {
    expect(hasPersistedTokenChanged(persisted(123), null)).toBe(false);
    expect(hasPersistedTokenChanged(JSON.stringify({ version: 1 }), null)).toBe(false);
    expect(hasPersistedTokenChanged('null', null)).toBe(false);
  });

  it.each(['', '{', 'not-json'])('저장된 값 %j 를 읽을 수 없으면 판단하지 않는다', (raw) => {
    expect(hasPersistedTokenChanged(raw, null)).toBe(false);
    expect(hasPersistedTokenChanged(raw, 'old-token')).toBe(false);
  });
});

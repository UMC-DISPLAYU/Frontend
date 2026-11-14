import { afterEach, expect, it } from 'vitest';

import {
  clearReceivedInvitationsRequest,
  hasReceivedInvitationsRequest,
  requestReceivedInvitations,
} from './receivedInvitationsRequest';

afterEach(() => clearReceivedInvitationsRequest());

it('요청이 없으면 마이에서 시트를 닫힌 채로 시작한다', () => {
  expect(hasReceivedInvitationsRequest()).toBe(false);
});

it('요청은 지우기 전까지 여러 번 읽어도 그대로다(StrictMode 초기값 두 번 호출)', () => {
  requestReceivedInvitations();

  expect(hasReceivedInvitationsRequest()).toBe(true);
  expect(hasReceivedInvitationsRequest()).toBe(true);
});

it('지운 뒤에는 다시 열리지 않는다', () => {
  requestReceivedInvitations();
  clearReceivedInvitationsRequest();

  expect(hasReceivedInvitationsRequest()).toBe(false);
});

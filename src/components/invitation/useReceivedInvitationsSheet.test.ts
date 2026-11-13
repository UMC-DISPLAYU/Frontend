import { afterEach, expect, it, vi } from 'vitest';

import { ReceivedInvitationsRedirect } from './ReceivedInvitationsRedirect';
import {
  clearReceivedInvitationsRequest,
  hasReceivedInvitationsRequest,
} from './receivedInvitationsRequest';
import { useReceivedInvitationsSheet } from './useReceivedInvitationsSheet';

const h = vi.hoisted(() => ({
  effects: [] as Array<() => void>,
  navigate: vi.fn(),
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => [typeof initial === 'function' ? initial() : initial, vi.fn()],
  useEffect: (effect: () => void) => {
    h.effects.push(effect);
  },
  useCallback: (callback: unknown) => callback,
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => h.navigate }));

const runEffects = () => h.effects.splice(0).forEach((effect) => effect());

afterEach(() => {
  clearReceivedInvitationsRequest();
  h.effects = [];
  vi.clearAllMocks();
});

it('그냥 마이에 들어오면 받은 초대 시트를 닫힌 채로 시작한다', () => {
  expect(useReceivedInvitationsSheet().isOpen).toBe(false);
});

it('/invitation-request 로 들어오면 마이로 바꿔 이동하고 시트를 연 채로 시작한다', () => {
  ReceivedInvitationsRedirect();
  runEffects();

  expect(h.navigate).toHaveBeenCalledWith('/my', { replace: true });
  expect(useReceivedInvitationsSheet().isOpen).toBe(true);
});

it('한 번 연 뒤에는 요청을 지워 다음에 마이에 올 때 다시 열리지 않는다', () => {
  ReceivedInvitationsRedirect();
  runEffects();
  useReceivedInvitationsSheet();
  runEffects();

  expect(hasReceivedInvitationsRequest()).toBe(false);
  expect(useReceivedInvitationsSheet().isOpen).toBe(false);
});

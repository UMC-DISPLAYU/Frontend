import { expect, it } from 'vitest';

import { ApiError } from '@/api/apiError';

import {
  getVerificationErrorMessage,
  initialState,
  verificationReducer,
} from './verificationState';

it.each([
  ['VERIFICATION_CODE_MISMATCH', '입력한 번호'],
  ['VERIFICATION_CODE_EXPIRED', '재발송'],
  ['VERIFICATION_ATTEMPTS_EXCEEDED', '재발송'],
  ['EMAIL_VERIFICATION_NOT_FOUND', '재발송'],
  ['EMAIL_SEND_COOLDOWN', '잠시 후'],
  ['TOO_MANY_REQUESTS', '잠시 후'],
  ['DUPLICATE_SCHOOL_EMAIL', '다른 이메일'],
  ['SCHOOL_EMAIL_DOMAIN_MISMATCH', '학교와 이메일'],
])('%s에 다음 행동을 안내한다', (code, expected) => {
  expect(
    getVerificationErrorMessage(new ApiError('server message', { code, status: 400 }), 'fallback'),
  ).toContain(expected);
});

it('네트워크·서버 장애와 알 수 없는 코드는 인증번호 불일치로 오인하지 않는다', () => {
  expect(
    getVerificationErrorMessage(
      new ApiError('timeout', { transportCode: 'ECONNABORTED' }),
      'fallback',
    ),
  ).toContain('시간이 초과');
  expect(
    getVerificationErrorMessage(
      new ApiError('server', { status: 500, code: 'VERIFICATION_CODE_MISMATCH' }),
      'fallback',
    ),
  ).toContain('서버');
  expect(
    getVerificationErrorMessage(
      new ApiError('서버의 새로운 안내', { status: 400, code: 'NEW_CODE' }),
      'fallback',
    ),
  ).toBe('서버의 새로운 안내');
  expect(getVerificationErrorMessage(new Error('internal'), 'fallback')).toBe('fallback');
});

it('실패는 입력과 유효 기간을 유지하고 재발송 성공 후에만 코드를 초기화해 재확인한다', () => {
  let state = verificationReducer(
    { ...initialState, school: '학교', email: 'a@school.kr' },
    { type: 'COMPLETE_STEP', payload: 'email' },
  );
  state = verificationReducer(state, { type: 'SET_CODE', payload: '123456' });
  const generation = state.emailGeneration;
  state = verificationReducer(state, {
    type: 'FAIL_STEP',
    payload: { step: 'code', error: '만료' },
  });
  expect(state.code).toBe('123456');
  expect(state.completedSteps.has('code')).toBe(false);
  state = verificationReducer(state, {
    type: 'FAIL_STEP',
    payload: { step: 'email', error: '재발송 실패' },
  });
  expect(state.emailGeneration).toBe(generation);
  expect(state.code).toBe('123456');
  state = verificationReducer(state, { type: 'COMPLETE_STEP', payload: 'email' });
  expect(state.emailGeneration).toBe(generation + 1);
  expect(state.code).toBe('');
  expect(state.errorMessage).toBeNull();
  expect(state.email).toBe('a@school.kr');
  state = verificationReducer(state, { type: 'SET_CODE', payload: '654321' });
  state = verificationReducer(state, { type: 'COMPLETE_STEP', payload: 'code' });
  expect(state.completedSteps.has('code')).toBe(true);
});

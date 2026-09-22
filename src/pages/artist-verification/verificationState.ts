import { ApiError } from '@/api/apiError';
import { getErrorMessage } from '@/utils/error';

type VerificationStep = 'school' | 'email' | 'code' | 'profile';

interface VerificationState {
  school: string;
  email: string;
  code: string;
  emailGeneration: number;
  completedSteps: Set<VerificationStep>;
  failedStep: VerificationStep | null;
  errorMessage: string | null;
}

type VerificationAction =
  | { type: 'SET_SCHOOL'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_CODE'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: VerificationStep }
  | { type: 'FAIL_STEP'; payload: { step: VerificationStep; error?: string } }
  | { type: 'RESET_FROM_STEP'; payload: VerificationStep };

export const initialState: VerificationState = {
  school: '',
  email: '',
  code: '',
  emailGeneration: 0,
  completedSteps: new Set(),
  failedStep: null,
  errorMessage: null,
};

export function verificationReducer(
  state: VerificationState,
  action: VerificationAction,
): VerificationState {
  switch (action.type) {
    case 'SET_SCHOOL': {
      const newState = { ...state, school: action.payload };
      newState.completedSteps = new Set();
      newState.failedStep = null;
      newState.errorMessage = null;
      newState.email = '';
      newState.code = '';
      return newState;
    }

    case 'SET_EMAIL': {
      const newState = { ...state, email: action.payload };
      newState.completedSteps = new Set();
      newState.failedStep = null;
      newState.errorMessage = null;
      newState.code = '';
      return newState;
    }

    case 'SET_CODE':
      return { ...state, code: action.payload };

    case 'COMPLETE_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      if (action.payload === 'email') {
        newCompletedSteps.delete('code');
        newCompletedSteps.delete('profile');
      }
      newCompletedSteps.add(action.payload);
      return {
        ...state,
        completedSteps: newCompletedSteps,
        code: action.payload === 'email' ? '' : state.code,
        emailGeneration: state.emailGeneration + (action.payload === 'email' ? 1 : 0),
        failedStep: null,
        errorMessage: null,
      };
    }

    case 'FAIL_STEP':
      return {
        ...state,
        failedStep: action.payload.step,
        errorMessage: action.payload.error ?? null,
      };

    case 'RESET_FROM_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      const stepOrder: VerificationStep[] = ['school', 'email', 'code', 'profile'];
      const stepIndex = stepOrder.indexOf(action.payload);
      for (let i = stepIndex; i < stepOrder.length; i++) {
        newCompletedSteps.delete(stepOrder[i]);
      }
      return { ...state, completedSteps: newCompletedSteps };
    }

    default:
      return state;
  }
}

const verificationMessages: Record<string, string> = {
  VERIFICATION_CODE_MISMATCH: '인증번호가 일치하지 않아요. 입력한 번호를 확인해주세요.',
  VERIFICATION_CODE_EXPIRED: '인증번호가 만료됐어요. 인증번호를 재발송해주세요.',
  VERIFICATION_ATTEMPTS_EXCEEDED: '인증번호 확인 횟수를 초과했어요. 인증번호를 재발송해주세요.',
  EMAIL_VERIFICATION_NOT_FOUND: '발급된 인증번호가 없어요. 인증번호를 재발송해주세요.',
  EMAIL_SEND_COOLDOWN: '인증 메일을 방금 발송했어요. 잠시 후 다시 요청해주세요.',
  TOO_MANY_REQUESTS: '인증 요청 횟수를 초과했어요. 잠시 후 다시 시도해주세요.',
  DUPLICATE_SCHOOL_EMAIL:
    '이미 다른 계정에서 인증한 학교 이메일이에요. 다른 이메일을 입력해주세요.',
  SCHOOL_EMAIL_DOMAIN_MISMATCH:
    '선택한 학교의 이메일 도메인과 달라요. 학교와 이메일을 확인해주세요.',
};

export const getVerificationErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError && (!error.status || error.status < 500) && error.code) {
    const message = verificationMessages[error.code];
    if (message) return message;
  }
  return getErrorMessage(error, fallback);
};

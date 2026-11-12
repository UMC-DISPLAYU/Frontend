export type NicknameCheckStatus = 'idle' | 'available' | 'unavailable' | 'error';

export type NicknameHelperTone = 'default' | 'pending' | 'error' | 'success';

const VALID_NICKNAME = /^[가-힣a-zA-Z0-9]{2,15}$/;
/* 입력 중인 한글 자모(ㄱ, ㅏ 등)는 조합이 끝나기 전 값이라 오류로 띄우지 않는다 */
const SPECIAL_CHAR = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/;
const WHITESPACE = /\s/;

export const isNicknameValid = (nickname: string) => VALID_NICKNAME.test(nickname);

/** 형식 오류 문구. 프로토타입처럼 특수문자 → 공백 → 길이 순서로 하나만 보여준다. */
export const getNicknameFormatError = (nickname: string): string | null => {
  if (SPECIAL_CHAR.test(nickname)) return '한글, 영문, 숫자만 쓸 수 있어요';
  if (WHITESPACE.test(nickname)) return '공백은 쓸 수 없어요';
  if (nickname.length === 1) return '2자 이상 입력해주세요';
  return null;
};

/** 닉네임 입력창 아래 안내 문구와 색. */
export const getNicknameHelper = (
  nickname: string,
  status: NicknameCheckStatus,
): { text: string; tone: NicknameHelperTone } => {
  const formatError = getNicknameFormatError(nickname);
  if (formatError) return { text: formatError, tone: 'error' };
  if (status === 'unavailable') return { text: '이미 사용 중인 닉네임이에요', tone: 'error' };
  if (status === 'error')
    return { text: '중복 확인에 실패했어요. 다시 시도해주세요', tone: 'error' };
  if (status === 'available') return { text: '사용할 수 있는 닉네임이에요', tone: 'success' };
  if (isNicknameValid(nickname)) return { text: '중복 확인을 해주세요', tone: 'pending' };
  return { text: '한글, 영문, 숫자로 2~15자', tone: 'default' };
};

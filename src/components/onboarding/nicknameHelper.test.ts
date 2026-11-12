import { describe, expect, it } from 'vitest';

import { getNicknameFormatError, getNicknameHelper, isNicknameValid } from './nicknameHelper';

describe('isNicknameValid', () => {
  it('한글 · 영문 · 숫자 2~15자만 통과한다', () => {
    expect(isNicknameValid('민재')).toBe(true);
    expect(isNicknameValid('newnick1')).toBe(true);
    expect(isNicknameValid('가'.repeat(15))).toBe(true);
  });

  it('1자, 16자, 공백, 특수문자, 미완성 자모는 통과하지 않는다', () => {
    expect(isNicknameValid('민')).toBe(false);
    expect(isNicknameValid('가'.repeat(16))).toBe(false);
    expect(isNicknameValid('민 재')).toBe(false);
    expect(isNicknameValid('민재!')).toBe(false);
    expect(isNicknameValid('민ㅈ')).toBe(false);
  });
});

describe('getNicknameFormatError', () => {
  it('특수문자와 공백이 함께 있으면 특수문자 문구를 먼저 보여준다', () => {
    expect(getNicknameFormatError('sj 2026!')).toBe('한글, 영문, 숫자만 쓸 수 있어요');
  });

  it('공백만 있으면 공백 문구를 보여준다', () => {
    expect(getNicknameFormatError('민 재')).toBe('공백은 쓸 수 없어요');
  });

  it('1자면 길이 문구를 보여준다', () => {
    expect(getNicknameFormatError('민')).toBe('2자 이상 입력해주세요');
  });

  it('빈 값과 입력 중인 자모는 오류로 보지 않는다', () => {
    expect(getNicknameFormatError('')).toBeNull();
    expect(getNicknameFormatError('민ㅈ')).toBeNull();
  });
});

describe('getNicknameHelper', () => {
  it('처음에는 규칙 안내를 보여준다', () => {
    expect(getNicknameHelper('', 'idle')).toEqual({
      text: '한글, 영문, 숫자로 2~15자',
      tone: 'default',
    });
  });

  it('형식이 맞지만 확인 전이면 중복 확인을 요청한다', () => {
    expect(getNicknameHelper('민재', 'idle')).toEqual({
      text: '중복 확인을 해주세요',
      tone: 'pending',
    });
  });

  it('중복 확인 결과에 따라 문구와 색이 바뀐다', () => {
    expect(getNicknameHelper('민재', 'unavailable').tone).toBe('error');
    expect(getNicknameHelper('newnick1', 'available')).toEqual({
      text: '사용할 수 있는 닉네임이에요',
      tone: 'success',
    });
    expect(getNicknameHelper('민재', 'error').tone).toBe('error');
  });

  it('형식 오류는 확인 결과보다 먼저 보여준다', () => {
    expect(getNicknameHelper('민재!', 'available').text).toBe('한글, 영문, 숫자만 쓸 수 있어요');
  });
});

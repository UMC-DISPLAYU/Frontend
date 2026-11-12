import { describe, expect, it } from 'vitest';

import { formatEffectiveDate, parsePolicyContent } from './parsePolicyContent';

const types = (content: string) => parsePolicyContent(content).map((block) => block.type);

describe('parsePolicyContent', () => {
  it('첫 조항 앞의 문장은 안내 문단으로 본다', () => {
    expect(parsePolicyContent('약관을 확인해 주세요.\n\n제1조 목적\n목적입니다.')).toEqual([
      { type: 'intro', text: '약관을 확인해 주세요.' },
      { type: 'heading', text: '제1조 목적' },
      { type: 'paragraph', text: '목적입니다.' },
    ]);
  });

  it('첫 조항 앞의 "라벨: 값" 줄은 요약 카드 하나로 묶고, 문장이 아닌 줄은 캡션으로 본다', () => {
    expect(
      parsePolicyContent(
        '수집 목적: 회원 식별\n보유 기간: 탈퇴 시까지\n\n자세한 처리방침\n\n1. 항목\n본문.',
      ),
    ).toEqual([
      {
        type: 'summary',
        items: [
          { label: '수집 목적', value: '회원 식별' },
          { label: '보유 기간', value: '탈퇴 시까지' },
        ],
      },
      { type: 'caption', text: '자세한 처리방침' },
      { type: 'heading', text: '1. 항목' },
      { type: 'paragraph', text: '본문.' },
    ]);
  });

  it('"-" 없이 여러 줄로 나열한 조항은 줄마다 글머리로 본다', () => {
    expect(types('제3조 가입\n소셜로그인으로 가입합니다.\n만 14세 이상만 가입합니다.')).toEqual([
      'heading',
      'bullet',
      'bullet',
    ]);
  });

  it('한 줄짜리 조항은 문단으로 둔다', () => {
    expect(types('제1조 목적\n이 약관의 목적입니다.')).toEqual(['heading', 'paragraph']);
  });

  it('"-" 글머리가 있는 조항의 일반 문장은 문단으로 둔다', () => {
    expect(types('6. 권리\n다음 권리가 있습니다.\n- 열람\n- 삭제\n\n메일로 요청합니다.')).toEqual([
      'heading',
      'paragraph',
      'bullet',
      'bullet',
      'paragraph',
    ]);
  });

  it('글머리 바로 앞의 문장이 아닌 줄은 소제목으로 본다', () => {
    expect(
      parsePolicyContent(
        '1. 수집 항목\n\n회원가입 시 필수 수집\n- 닉네임\n\n위치 기능 이용 시(선택)\n- 현재 위치',
      ),
    ).toEqual([
      { type: 'heading', text: '1. 수집 항목' },
      { type: 'subheading', text: '회원가입 시 필수 수집' },
      { type: 'bullet', text: '닉네임' },
      { type: 'subheading', text: '위치 기능 이용 시(선택)' },
      { type: 'bullet', text: '현재 위치' },
    ]);
  });

  it('조항 안의 "라벨: 값" 줄은 정의로 본다', () => {
    expect(parsePolicyContent('제2조 정의\n회원: 가입한 이용자')).toEqual([
      { type: 'heading', text: '제2조 정의' },
      { type: 'definition', label: '회원', value: '가입한 이용자' },
    ]);
  });

  it('마지막 조항 뒤에 빈 줄로 떨어진 "라벨: 값" 묶음은 하단 정보로 본다', () => {
    expect(
      parsePolicyContent(
        '제4조 준거법\n대한민국 법을 따릅니다.\n\n서비스명: 디유\n운영자: 운영팀',
      ).at(-1),
    ).toEqual({
      type: 'footer',
      items: [
        { label: '서비스명', value: '디유' },
        { label: '운영자', value: '운영팀' },
      ],
    });
  });

  it('빈 줄 없이 조항 제목 바로 아래 있는 "라벨: 값" 줄은 하단 정보가 아니라 정의다', () => {
    expect(types('8. 제공자 정보\n서비스명: 디유\n운영자: 운영팀')).toEqual([
      'heading',
      'definition',
      'definition',
    ]);
  });

  it('하단 정보는 마지막 조항에서만 찾는다', () => {
    expect(types('1. 첫 조항\n본문.\n\n담당: 운영팀\n\n2. 둘째 조항\n본문.')).toEqual([
      'heading',
      'paragraph',
      'definition',
      'heading',
      'paragraph',
    ]);
  });

  it('콜론 뒤에 공백이 없는 URL은 라벨로 보지 않는다', () => {
    expect(types('제1조 안내\nhttps://displayu.co.kr 에서 확인합니다.')).toEqual([
      'heading',
      'paragraph',
    ]);
  });

  it('조항 제목이 없으면 전체를 한 조항처럼 나눈다', () => {
    expect(types('첫 줄입니다.\n둘째 줄입니다.')).toEqual(['bullet', 'bullet']);
  });

  it('빈 내용은 빈 배열을 돌려준다', () => {
    expect(parsePolicyContent('')).toEqual([]);
    expect(parsePolicyContent('\n \n')).toEqual([]);
  });
});

describe('formatEffectiveDate', () => {
  it('YYYY-MM-DD를 피그마 표기로 바꾼다', () => {
    expect(formatEffectiveDate('2026-08-01')).toBe('2026. 08. 01');
  });

  it('다른 형식은 그대로 둔다', () => {
    expect(formatEffectiveDate('2026. 08. 01')).toBe('2026. 08. 01');
    expect(formatEffectiveDate('2026-08-01T00:00:00')).toBe('2026-08-01T00:00:00');
  });
});

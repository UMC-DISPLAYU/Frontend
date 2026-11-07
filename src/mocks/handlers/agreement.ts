import { delay, http } from 'msw';

import type { AgreementDto } from '@/api/dto';
import { fail, paths, success } from '@/mocks/response';
import { hasMockScenario, MOCK_DELAY_MS } from '@/mocks/scenario';

/* 실제 서버 약관과 같은 형식(소개 문장, "-" 없는 항목, "라벨: 값" 줄, 하단 정보)을 따른다 */
const agreements: AgreementDto[] = [
  {
    agreementId: 1,
    code: 'TERMS_OF_SERVICE',
    title: '서비스 이용약관',
    type: 'SIGNUP',
    content: [
      '디유 서비스를 이용하기 전에 이용 조건과 회원의 권리 및 의무를 확인해 주세요.',
      '',
      '제1조 목적',
      '이 약관은 디유가 제공하는 서비스의 이용 조건을 규정하는 것을 목적으로 합니다.',
      '',
      '제2조 용어의 정의',
      '서비스: 디유가 제공하는 전시 탐색, 작품 감상, 전시 등록 및 소통 기능 일체',
      '회원: 소셜로그인을 통해 가입하고 이 약관에 동의한 이용자',
      '',
      '제3조 회원가입 및 계정 관리',
      '카카오, 구글 소셜로그인을 통해 가입할 수 있습니다.',
      '계정을 타인에게 양도하거나 공유할 수 없습니다.',
      '만 14세 이상인 이용자만 가입할 수 있습니다.',
      '',
      '제4조 분쟁 해결 및 준거법',
      '이 약관은 대한민국 법률을 준거법으로 합니다.',
      '분쟁 발생 시 운영자와 회원은 상호 협의를 우선합니다.',
      '',
      '서비스명: 디유(displayU)',
      '운영자: 디유 운영팀',
      '문의 메일: help@example.com',
    ].join('\n'),
    required: true,
    version: '1.0',
    effectiveDate: '2026-08-01',
    displayOrder: 1,
  },
  {
    agreementId: 2,
    code: 'PRIVACY_COLLECTION_USE',
    title: '개인정보 수집·이용 동의',
    type: 'SIGNUP',
    content: [
      '수집 목적: 회원 식별, 계정 관리 및 서비스 제공',
      '보유 기간: 회원 탈퇴 시까지',
      '동의 거부: 필수 정보 미동의 시 회원가입 제한',
      '',
      '자세한 개인정보 처리방침',
      '',
      '1. 수집하는 개인정보',
      '',
      '회원가입 시 필수 수집',
      '- 소셜로그인 제공사 식별값',
      '- 디유에서 사용할 서비스 닉네임',
      '',
      '위치 기능 이용 시(선택)',
      '- 이용자가 위치 사용을 허용한 시점의 현재 위치',
      '',
      '2. 이용자의 권리',
      '이용자는 다음 권리를 행사할 수 있습니다.',
      '- 개인정보 열람',
      '- 삭제',
      '',
      '문의 이메일을 통해 권리를 행사할 수 있습니다.',
      '',
      '3. 개인정보 보호 담당자',
      '담당 부서: 디유 운영팀',
      '문의메일: help@example.com',
    ].join('\n'),
    required: true,
    version: '1.0',
    effectiveDate: '2026-08-01',
    displayOrder: 2,
  },
  {
    agreementId: 3,
    code: 'LOCATION_BASED_SERVICE',
    title: '위치기반서비스 이용약관',
    type: 'SIGNUP',
    content: [
      '현재 위치를 활용하여 가까운 전시를 표시합니다.',
      '',
      '1. 위치기반서비스의 목적',
      '- 이용자의 현재 위치를 기준으로 가까운 전시를 추천합니다.',
      '- 현재 위치와 전시장 사이의 거리를 표시합니다.',
      '',
      '2. 제3자 제공',
      '이용자의 개인위치정보를 제3자에게 제공하지 않습니다.',
      '',
      '3. 서비스 제공자 정보',
      '서비스명: 디유(displayU)',
      '문의 이메일: help@example.com',
    ].join('\n'),
    required: false,
    version: '1.0',
    effectiveDate: '2026-08-01',
    displayOrder: 3,
  },
];

export const agreementHandlers = paths('/api/v1/agreements').map((path) =>
  http.get(path, async () => {
    if (hasMockScenario('agreements-slow')) await delay(MOCK_DELAY_MS);
    if (hasMockScenario('agreements-fail')) {
      return fail(
        '/api/v1/agreements',
        500,
        'INTERNAL_SERVER_ERROR',
        '약관 목록을 불러오지 못했습니다.',
      );
    }
    if (hasMockScenario('agreements-empty')) return success('/api/v1/agreements', []);

    return success('/api/v1/agreements', agreements);
  }),
);

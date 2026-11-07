import { delay, http } from 'msw';

import type {
  ConfirmVerificationEmailRequestDto,
  ConfirmVerificationEmailResponseDataDto,
  SendVerificationEmailRequestDto,
} from '@/api/dto';
import { mockDb } from '@/mocks/data/repository';
import { fail, noContent, paths, readJson, success } from '@/mocks/response';

/*
 * 작가 인증 흐름을 실서버처럼 확인하기 위한 가짜 API입니다.
 * - 인증번호는 항상 123456 입니다.
 * - 이메일 도메인이 선택한 학교와 다르면 실패합니다. (홍익대학교 → @hongik.ac.kr, @g.hongik.ac.kr)
 * - 아이디가 duplicate 인 이메일(duplicate@hongik.ac.kr)은 이미 다른 계정이 인증한 이메일로 처리합니다.
 * - 같은 이메일로 10초 안에 다시 보내면 쿨다운, 인증번호를 5번 틀리면 횟수 초과,
 *   발송 후 5분이 지나면 만료됩니다.
 */
export const MOCK_VERIFICATION_CODE = '123456';

const CODE_TTL_MS = 5 * 60 * 1000;
const SEND_COOLDOWN_MS = 10 * 1000;
const MAX_CONFIRM_ATTEMPTS = 5;

const MOCK_SCHOOLS = [
  { name: '홍익대학교', domain: 'hongik.ac.kr' },
  { name: '중앙대학교', domain: 'cau.ac.kr' },
  { name: '국민대학교', domain: 'kookmin.ac.kr' },
  { name: '건국대학교', domain: 'konkuk.ac.kr' },
  { name: '경희대학교', domain: 'khu.ac.kr' },
  { name: '서울대학교', domain: 'snu.ac.kr' },
  { name: '서울과학기술대학교', domain: 'seoultech.ac.kr' },
  { name: '서울시립대학교', domain: 'uos.ac.kr' },
  { name: '서울여자대학교', domain: 'swu.ac.kr' },
  { name: '성균관대학교', domain: 'skku.edu' },
  { name: '숙명여자대학교', domain: 'sookmyung.ac.kr' },
  { name: '이화여자대학교', domain: 'ewha.ac.kr' },
  { name: '한국예술종합학교', domain: 'karts.ac.kr' },
  { name: '한양대학교', domain: 'hanyang.ac.kr' },
];

type PendingVerification = {
  schoolEmail: string;
  univName: string;
  sentAt: number;
  expiresAt: number;
  attempts: number;
};

let pending: PendingVerification | null = null;

const EMAIL_PATTERN = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;

/* 메일 발송·재발송 공통 검증. 통과하면 새 인증 대기 상태를 만들고 null을 돌려줍니다. */
const startVerification = (path: string, body: Partial<SendVerificationEmailRequestDto>) => {
  const schoolEmail = body.schoolEmail?.trim() ?? '';
  const univName = body.univName?.trim() ?? '';
  const domain = EMAIL_PATTERN.exec(schoolEmail)?.[1]?.toLowerCase();

  if (!domain) {
    return fail(path, 400, 'INVALID_EMAIL_FORMAT', '이메일 형식이 올바르지 않습니다.');
  }

  const school = MOCK_SCHOOLS.find((item) => item.name === univName);
  if (!school) {
    return fail(path, 400, 'SCHOOL_NOT_FOUND', '학교를 목록에서 선택해주세요.');
  }

  if (domain !== school.domain && !domain.endsWith(`.${school.domain}`)) {
    return fail(
      path,
      400,
      'SCHOOL_EMAIL_DOMAIN_MISMATCH',
      '선택한 학교의 웹메일과 일치하지 않습니다.',
    );
  }

  if (schoolEmail.split('@')[0].toLowerCase() === 'duplicate') {
    return fail(path, 409, 'DUPLICATE_SCHOOL_EMAIL', '이미 인증된 학교 이메일입니다.');
  }

  const now = Date.now();
  if (pending?.schoolEmail === schoolEmail && now - pending.sentAt < SEND_COOLDOWN_MS) {
    return fail(path, 429, 'EMAIL_SEND_COOLDOWN', '잠시 후 다시 요청해주세요.');
  }

  pending = { schoolEmail, univName, sentAt: now, expiresAt: now + CODE_TTL_MS, attempts: 0 };
  return null;
};

const SEND_PATH = '/api/v1/users/me/verification/email/send';
const RESEND_PATH = '/api/v1/users/me/verification/email/resend';
const CONFIRM_PATH = '/api/v1/users/me/verification/email/confirm';

export const schoolVerificationHandlers = [
  ...paths('/api/v1/schools').map((path) =>
    http.get(path, async ({ request }) => {
      await delay(300);
      const keyword = (new URL(request.url).searchParams.get('keyword') ?? '').trim();
      const schools = MOCK_SCHOOLS.filter((school) => school.name.includes(keyword)).map(
        ({ name }) => ({ name }),
      );

      return success('/api/v1/schools', { schools });
    }),
  ),
  ...paths(SEND_PATH).map((path) =>
    http.post(path, async ({ request }) => {
      await delay(700);
      const body = await readJson<SendVerificationEmailRequestDto>(request);

      return startVerification(SEND_PATH, body) ?? noContent(SEND_PATH);
    }),
  ),
  ...paths(RESEND_PATH).map((path) =>
    http.post(path, async ({ request }) => {
      await delay(700);
      const body = await readJson<SendVerificationEmailRequestDto>(request);

      return startVerification(RESEND_PATH, body) ?? noContent(RESEND_PATH);
    }),
  ),
  ...paths(CONFIRM_PATH).map((path) =>
    http.post(path, async ({ request }) => {
      await delay(500);
      const body = await readJson<ConfirmVerificationEmailRequestDto>(request);

      if (!pending || pending.schoolEmail !== body.schoolEmail?.trim()) {
        return fail(
          CONFIRM_PATH,
          400,
          'EMAIL_VERIFICATION_NOT_FOUND',
          '발급된 인증번호가 없습니다.',
        );
      }

      if (Date.now() > pending.expiresAt) {
        return fail(CONFIRM_PATH, 400, 'VERIFICATION_CODE_EXPIRED', '인증번호가 만료되었습니다.');
      }

      if (pending.attempts >= MAX_CONFIRM_ATTEMPTS) {
        return fail(
          CONFIRM_PATH,
          429,
          'VERIFICATION_ATTEMPTS_EXCEEDED',
          '인증번호 확인 횟수를 초과했습니다.',
        );
      }

      if (body.verificationCode !== MOCK_VERIFICATION_CODE) {
        pending.attempts += 1;
        return fail(
          CONFIRM_PATH,
          400,
          'VERIFICATION_CODE_MISMATCH',
          '인증번호가 일치하지 않습니다.',
        );
      }

      mockDb.me.school = pending.univName;
      mockDb.me.schoolEmail = pending.schoolEmail;
      mockDb.me.isEmailVerified = true;
      const data: ConfirmVerificationEmailResponseDataDto = {
        schoolEmail: pending.schoolEmail,
        isVerified: true,
      };
      pending = null;

      return success(CONFIRM_PATH, data);
    }),
  ),
];

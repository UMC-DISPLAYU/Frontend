import { describe, expect, it } from 'vitest';

import type { AgreementDto } from '@/api/dto';
import type { TermState } from '@/components/onboarding';

import { buildSignupAgreements, hasRequiredTerms } from './signupAgreements';

const agreement = (code: string, version = '1.0'): AgreementDto => ({
  agreementId: code.length,
  code,
  title: code,
  type: 'SIGNUP',
  content: '',
  required: code !== 'LOCATION_BASED_SERVICE',
  version,
  effectiveDate: '2026-08-01',
  displayOrder: 0,
});

const ALL_AGREEMENTS = [
  agreement('TERMS_OF_SERVICE', '1.2'),
  agreement('PRIVACY_COLLECTION_USE'),
  agreement('LOCATION_BASED_SERVICE'),
];

const terms = (overrides: Partial<TermState> = {}): TermState => ({
  service: true,
  over14: true,
  ...overrides,
});

describe('hasRequiredTerms', () => {
  it('서비스 이용약관과 만 14세 확인에 모두 체크해야 true', () => {
    expect(hasRequiredTerms(terms())).toBe(true);
  });

  it.each(['service', 'over14'] as const)('%s 미체크면 false', (key) => {
    expect(hasRequiredTerms(terms({ [key]: false }))).toBe(false);
  });
});

describe('buildSignupAgreements', () => {
  it('서비스 이용약관만 서버 버전과 함께 담는다', () => {
    expect(buildSignupAgreements(terms(), ALL_AGREEMENTS)).toEqual([
      { code: 'TERMS_OF_SERVICE', version: '1.2' },
    ]);
  });

  it('개인정보 수집·이용과 위치기반서비스는 목록에 있어도 담지 않는다', () => {
    const codes = buildSignupAgreements(terms(), ALL_AGREEMENTS)?.map(({ code }) => code);
    expect(codes).not.toContain('PRIVACY_COLLECTION_USE');
    expect(codes).not.toContain('LOCATION_BASED_SERVICE');
  });

  it('서비스 이용약관 문서가 목록에 없으면 null', () => {
    expect(buildSignupAgreements(terms(), [agreement('PRIVACY_COLLECTION_USE')])).toBeNull();
    expect(buildSignupAgreements(terms(), [])).toBeNull();
  });
});

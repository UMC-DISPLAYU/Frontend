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
  over14: true,
  service: true,
  privacy: true,
  location: false,
  ...overrides,
});

describe('hasRequiredTerms', () => {
  it('만 14세 확인과 필수 약관에 모두 동의해야 true', () => {
    expect(hasRequiredTerms(terms())).toBe(true);
  });

  it.each(['over14', 'service', 'privacy'] as const)('%s 미동의면 false', (key) => {
    expect(hasRequiredTerms(terms({ [key]: false }))).toBe(false);
  });

  it('선택 약관은 결과에 영향을 주지 않는다', () => {
    expect(hasRequiredTerms(terms({ location: true }))).toBe(true);
  });
});

describe('buildSignupAgreements', () => {
  it('동의한 약관만 서버 버전과 함께 담는다', () => {
    expect(buildSignupAgreements(terms(), ALL_AGREEMENTS)).toEqual([
      { code: 'TERMS_OF_SERVICE', version: '1.2' },
      { code: 'PRIVACY_COLLECTION_USE', version: '1.0' },
    ]);
  });

  it('선택 약관에 동의하면 함께 담는다', () => {
    expect(buildSignupAgreements(terms({ location: true }), ALL_AGREEMENTS)).toContainEqual({
      code: 'LOCATION_BASED_SERVICE',
      version: '1.0',
    });
  });

  it('필수 약관 문서가 목록에 없으면 null', () => {
    expect(buildSignupAgreements(terms(), [agreement('TERMS_OF_SERVICE')])).toBeNull();
    expect(buildSignupAgreements(terms(), [])).toBeNull();
  });

  it('선택 약관 문서가 없으면 동의했어도 빼고 가입시킨다', () => {
    const withoutLocation = ALL_AGREEMENTS.slice(0, 2);
    expect(buildSignupAgreements(terms({ location: true }), withoutLocation)).toHaveLength(2);
  });
});

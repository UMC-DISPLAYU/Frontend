import type { AgreementDto, SignupAgreementDto } from '@/api/dto';
import type { PolicyTermKey, TermState } from '@/components/onboarding';

export const AGREEMENT_CODES: Record<PolicyTermKey, string> = {
  service: 'TERMS_OF_SERVICE',
  privacy: 'PRIVACY_COLLECTION_USE',
  location: 'LOCATION_BASED_SERVICE',
};

const REQUIRED_TERMS = ['service', 'privacy'] as const satisfies readonly PolicyTermKey[];
const POLICY_TERMS = ['service', 'privacy', 'location'] as const satisfies readonly PolicyTermKey[];

export const findAgreement = (agreements: AgreementDto[] | undefined, key: PolicyTermKey) =>
  agreements?.find((agreement) => agreement.code === AGREEMENT_CODES[key]);

export const hasRequiredTerms = (terms: TermState) =>
  terms.over14 && REQUIRED_TERMS.every((key) => terms[key]);

/**
 * 동의한 약관을 가입 요청 형식으로 바꾼다.
 * 필수 약관 문서를 서버 목록에서 찾지 못하면 null — 버전 없이 가입시키지 않기 위해서다.
 */
export const buildSignupAgreements = (
  terms: TermState,
  agreements: AgreementDto[],
): SignupAgreementDto[] | null => {
  const hasRequiredDocuments = REQUIRED_TERMS.every((key) => findAgreement(agreements, key));
  if (!hasRequiredDocuments) return null;

  return POLICY_TERMS.filter((key) => terms[key])
    .map((key) => findAgreement(agreements, key))
    .filter((agreement): agreement is AgreementDto => Boolean(agreement))
    .map(({ code, version }) => ({ code, version }));
};

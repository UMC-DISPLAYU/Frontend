import type { AgreementDto, SignupAgreementDto } from '@/api/dto';
import type { TermState } from '@/components/onboarding';

const SERVICE_AGREEMENT_CODE = 'TERMS_OF_SERVICE';

export const hasRequiredTerms = (terms: TermState) => terms.service && terms.over14;

/**
 * 동의한 약관을 가입 요청 형식으로 바꾼다.
 * 서비스 이용약관 문서를 서버 목록에서 찾지 못하면 null — 버전 없이 가입시키지 않기 위해서다.
 */
export const buildSignupAgreements = (
  terms: TermState,
  agreements: AgreementDto[],
): SignupAgreementDto[] | null => {
  const service = agreements.find((agreement) => agreement.code === SERVICE_AGREEMENT_CODE);
  if (!service) return null;

  return terms.service ? [{ code: service.code, version: service.version }] : [];
};

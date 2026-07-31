import type { ApiResponseDto } from './common.dto';

export interface AgreementDto {
  agreementId: number;
  code: string;
  title: string;
  type: string;
  content: string;
  required: boolean;
  version: string;
  effectiveDate: string;
  displayOrder: number;
}

export type GetAgreementsResponseDto = ApiResponseDto<AgreementDto[]>;

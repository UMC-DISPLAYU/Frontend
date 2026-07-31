import type { AgreementDto } from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/agreements
export const getAgreements = async (): Promise<AgreementDto[]> => apiRequest('/v1/agreements');

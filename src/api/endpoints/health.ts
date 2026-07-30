import { apiRequest } from '../client';

// GET /v1/health
export const getHealth = async (): Promise<unknown> => apiRequest('/v1/health');

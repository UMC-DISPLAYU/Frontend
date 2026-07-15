import type {
  CheckNicknameRequestDto,
  CheckNicknameResponseDataDto,
  ConfirmVerificationEmailRequestDto,
  ConfirmVerificationEmailResponseDataDto,
  ResendVerificationEmailRequestDto,
  SendVerificationEmailRequestDto,
  UpdateNicknameRequestDto,
  UpdateNicknameResponseDataDto,
  UserProfileDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/user/email/verification
export const sendVerificationEmail = async (body: SendVerificationEmailRequestDto): Promise<null> =>
  apiRequest('/v1/user/email/verification', { method: 'POST', body });

// POST /v1/user/email/verification/confirm
export const confirmVerificationEmail = async (
  body: ConfirmVerificationEmailRequestDto,
): Promise<ConfirmVerificationEmailResponseDataDto> =>
  apiRequest('/v1/user/email/verification/confirm', { method: 'POST', body });

// POST /v1/user/email/verification/resend
export const resendVerificationEmail = async (
  body: ResendVerificationEmailRequestDto,
): Promise<null> => apiRequest('/v1/user/email/verification/resend', { method: 'POST', body });

// GET /v1/user/nickname/check
export const checkNickname = async (
  params: CheckNicknameRequestDto,
): Promise<CheckNicknameResponseDataDto> =>
  apiRequest('/v1/user/nickname/check', { query: params });

// GET /v1/user/me
export const getUserMe = async (): Promise<UserProfileDto> => apiRequest('/v1/user/me');

// DELETE /v1/user/me
export const deleteUserMe = async (): Promise<null> =>
  apiRequest('/v1/user/me', { method: 'DELETE' });

// PATCH /v1/user/me/nickname
export const updateNickname = async (
  body: UpdateNicknameRequestDto,
): Promise<UpdateNicknameResponseDataDto> =>
  apiRequest('/v1/user/me/nickname', { method: 'PATCH', body });

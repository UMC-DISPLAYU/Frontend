import type {
  ArtistProfileDto,
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

// POST /v1/users/me/verification/email/send
export const sendVerificationEmail = async (body: SendVerificationEmailRequestDto): Promise<null> =>
  apiRequest('/v1/users/me/verification/email/send', { method: 'POST', body });

// POST /v1/users/me/verification/email/confirm
export const confirmVerificationEmail = async (
  body: ConfirmVerificationEmailRequestDto,
): Promise<ConfirmVerificationEmailResponseDataDto> =>
  apiRequest('/v1/users/me/verification/email/confirm', { method: 'POST', body });

// POST /v1/users/me/verification/email/resend
export const resendVerificationEmail = async (
  body: ResendVerificationEmailRequestDto,
): Promise<null> => apiRequest('/v1/users/me/verification/email/resend', { method: 'POST', body });

// GET /v1/users/nickname/check
export const checkNickname = async (
  params: CheckNicknameRequestDto,
): Promise<CheckNicknameResponseDataDto> =>
  apiRequest('/v1/users/nickname/check', { query: params });

// GET /v1/users/me
export const getUserMe = async (): Promise<UserProfileDto> => apiRequest('/v1/users/me');

// DELETE /v1/users/me
export const deleteUserMe = async (): Promise<null> =>
  apiRequest('/v1/users/me', { method: 'DELETE' });

// PATCH /v1/users/me/nickname
export const updateNickname = async (
  body: UpdateNicknameRequestDto,
): Promise<UpdateNicknameResponseDataDto> =>
  apiRequest('/v1/users/me/nickname', { method: 'PATCH', body });

// GET /v1/users/me/artist-profile
export const getMyArtistProfile = async (): Promise<ArtistProfileDto> =>
  apiRequest('/v1/users/me/artist-profile');

// GET /v1/users/:userId/artist-profile
export const getUserArtistProfile = async (
  userId: number,
): Promise<Omit<ArtistProfileDto, 'status'>> => apiRequest(`/v1/users/${userId}/artist-profile`);

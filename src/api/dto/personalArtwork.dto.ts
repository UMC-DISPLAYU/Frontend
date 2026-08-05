import type { ApiResponseDto, ImageRequestDto, ImageResponseDto } from './common.dto';

export interface PersonalArtworkRequestDto {
  artworkName: string;
  content?: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  images: ImageRequestDto[];
}

export interface PersonalArtworkResponseDataDto {
  personalArtworkId: number;
  userId: number;
  nickname?: string;
  profileImageUrl?: string | null;
  artworkName: string;
  content?: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  createdAt: string;
  isLiked?: boolean;
  likeCount?: number;
  images: ImageResponseDto[];
}

export interface PersonalArtworkSummaryDto {
  personalArtworkId: number;
  artworkName: string;
  thumbnailUrl: string;
  type: string;
  createdAt: string;
}

export type GetPersonalArtworksResponseDataDto = PersonalArtworkSummaryDto[];

export type GetPersonalArtworksResponseDto = ApiResponseDto<GetPersonalArtworksResponseDataDto>;

export type GetPersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type CreatePersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type UpdatePersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type DeletePersonalArtworkResponseDto = ApiResponseDto<null>;

export interface PersonalArtworkFeelingImageRequestDto {
  imageUrl: string;
  width?: number;
  height?: number;
  sortOrder?: number;
}

export interface CreatePersonalArtworkFeelingRequestDto {
  content: string;
  images?: PersonalArtworkFeelingImageRequestDto[];
}

export interface PersonalArtworkFeelingResponseDataDto {
  personalFeelingId: number;
  personalArtworkId?: number;
  userId: number;
  nickname?: string;
  profileImageUrl?: string | null;
  content: string;
  createdAt: string;
  images: ImageResponseDto[];
  isLiked?: boolean;
  likeCount?: number;
  replyCount?: number;
}

export interface GetPersonalArtworkFeelingsResponseDataDto {
  feelings: PersonalArtworkFeelingResponseDataDto[];
}

export interface CreatePersonalArtworkQuestionRequestDto {
  content: string;
  isPublic?: boolean;
}

export interface PersonalArtworkQuestionResponseDataDto {
  personalQuestionId: number;
  personalArtworkId?: number;
  content: string;
  isPublic: boolean;
  answerStatus: 'WAITING' | 'ANSWERED' | string;
  createdAt: string;
  userId: number;
  nickname?: string;
  profileImageUrl?: string | null;
  isLiked?: boolean;
  likeCount?: number;
}

export interface GetPersonalArtworkQuestionsResponseDataDto {
  questions: PersonalArtworkQuestionResponseDataDto[];
}

export interface CreatePersonalArtworkReplyRequestDto {
  content: string;
}

export interface PersonalArtworkFeelingReplyDto {
  personalFeelingReplyId: number;
  createdAt: string;
  content: string;
  personalFeelingId: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
  isLiked?: boolean;
  likeCount?: number;
}

export interface PersonalArtworkFeelingReplyListResponseDataDto {
  replies: PersonalArtworkFeelingReplyDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export interface PersonalArtworkQuestionReplyResponseDataDto {
  personalQuestionReplyId: number;
  createdAt: string;
  content: string;
  personalQuestionId: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
  isLiked?: boolean;
  likeCount?: number;
}

export type GetPersonalArtworkQuestionReplyResponseDataDto =
  PersonalArtworkQuestionReplyResponseDataDto | null;

export interface PersonalArtworkLikeResponseDataDto {
  personalArtworkId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface PersonalArtworkFeelingLikeResponseDataDto {
  personalFeelingId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface PersonalArtworkFeelingReplyLikeResponseDataDto {
  personalFeelingReplyId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface PersonalArtworkQuestionLikeResponseDataDto {
  personalQuestionId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface PersonalArtworkQuestionReplyLikeResponseDataDto {
  personalQuestionReplyId: number;
  isLiked: boolean;
  likeCount: number;
}

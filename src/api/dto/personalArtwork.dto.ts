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
  isArchived?: boolean;
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
  isArchived?: boolean;
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

/* 개인 작품 감상평/질문/답변에 공통으로 실려오는 작성자 정보. 작성자 계정이 삭제되면 null입니다. */
export interface PersonalArtworkUserDto {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  isCreator: boolean;
}

export interface PersonalArtworkFeelingResponseDataDto {
  personalFeelingId: number;
  personalArtworkId?: number;
  user: PersonalArtworkUserDto | null;
  content: string;
  createdAt: string;
  isDeleted?: boolean;
  isMine?: boolean;
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
  content: string | null;
  isPublic: boolean;
  /* 비공개 질문을 열람할 권한이 없으면 false — content/user 등이 함께 비어옵니다. */
  accessible?: boolean;
  isMine?: boolean;
  canReply?: boolean;
  answerStatus: 'WAITING' | 'ANSWERED' | string;
  createdAt: string;
  images?: ImageResponseDto[];
  user: PersonalArtworkUserDto | null;
  isLiked?: boolean;
  likeCount?: number | null;
  reply?: PersonalArtworkQuestionReplyResponseDataDto | null;
}

export interface GetPersonalArtworkQuestionsResponseDataDto {
  questions: PersonalArtworkQuestionResponseDataDto[];
}

export interface CreatePersonalArtworkReplyRequestDto {
  content: string;
  images?: PersonalArtworkFeelingImageRequestDto[];
}

export interface PersonalArtworkFeelingReplyDto {
  personalFeelingReplyId: number;
  createdAt: string;
  content: string;
  personalFeelingId?: number;
  user: PersonalArtworkUserDto | null;
  isLiked?: boolean;
  likeCount?: number;
  images?: ImageResponseDto[];
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
  personalQuestionId?: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
  isMine?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  images?: ImageResponseDto[];
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

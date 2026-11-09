import type { ApiResponseDto, ImageRequestDto, ImageResponseDto } from './common.dto';

export interface PersonalArtworkRequestDto {
  artworkName: string;
  content?: string;
  type: string;
  types?: string[];
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  images: ImageRequestDto[];
}

export interface PersonalArtworkResponseDataDto {
  personalArtworkId: number;
  userId: number;
  artistName?: string;
  artworkName: string;
  content?: string;
  type: string;
  types?: string[];
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

/* 개인 작품 감상평에 공통으로 실려오는 작성자 정보. 작성자 계정이 삭제되면 null입니다. */
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

import type { ApiResponseDto, CursorPageInfoDto, ImageResponseDto } from './common.dto';

export interface DisplayReviewImageRequestDto {
  imageUrl: string;
  width?: number;
  height?: number;
}

export interface CreateDisplayReviewRequestDto {
  content: string;
  images?: DisplayReviewImageRequestDto[];
}

export interface DisplayReviewUserDto {
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface DisplayReviewItemDto {
  displayReviewId: number;
  content: string;
  createdAt: string;
  user: DisplayReviewUserDto;
  images: ImageResponseDto[];
  likeCount: number;
  replyCount: number;
}

export interface GetDisplayReviewsResponseDataDto extends CursorPageInfoDto {
  reviews: DisplayReviewItemDto[];
}

export type GetDisplayReviewsResponseDto = ApiResponseDto<GetDisplayReviewsResponseDataDto>;

export interface CreateDisplayReviewResponseDataDto {
  displayReviewId: number;
  content: string;
  createdAt: string;
  displayId: number;
  userId: number;
  images: {
    reviewImageId: number;
    imageUrl: string;
    width: number;
    height: number;
    sortOrder: number;
  }[];
}

export type CreateDisplayReviewResponseDto = ApiResponseDto<CreateDisplayReviewResponseDataDto>;

export interface DeletedDisplayReviewResponseDataDto {
  displayReviewId: number;
  deletedAt: string;
}

export type DeleteDisplayReviewResponseDto = ApiResponseDto<DeletedDisplayReviewResponseDataDto>;

export interface DisplayReviewLikeResponseDataDto {
  displayReviewId: number;
  liked: boolean;
  likeCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export type ToggleDisplayReviewLikeResponseDto = ApiResponseDto<DisplayReviewLikeResponseDataDto>;

export interface CreateDisplayReviewReplyRequestDto {
  content: string;
}

export interface DisplayReviewReplyItemDto {
  displayReviewReplyId: number;
  content: string;
  createdAt: string;
  user: DisplayReviewUserDto;
  isTeamMember: boolean;
  likeCount: number;
}

export interface GetDisplayReviewRepliesResponseDataDto extends CursorPageInfoDto {
  replies: DisplayReviewReplyItemDto[];
}

export type GetDisplayReviewRepliesResponseDto =
  ApiResponseDto<GetDisplayReviewRepliesResponseDataDto>;

export interface CreateDisplayReviewReplyResponseDataDto {
  displayReviewReplyId: number;
  createdAt: string;
  content: string;
  displayReviewId: number;
  userId: number;
  nickname: string;
  isTeamMember: boolean;
}

export type CreateDisplayReviewReplyResponseDto =
  ApiResponseDto<CreateDisplayReviewReplyResponseDataDto>;

export interface DeletedDisplayReviewReplyResponseDataDto {
  displayReviewReplyId: number;
  deletedAt: string;
}

export type DeleteDisplayReviewReplyResponseDto =
  ApiResponseDto<DeletedDisplayReviewReplyResponseDataDto>;

export interface DisplayReviewReplyLikeResponseDataDto {
  displayReviewReplyId: number;
  liked: boolean;
  likeCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export type ToggleDisplayReviewReplyLikeResponseDto =
  ApiResponseDto<DisplayReviewReplyLikeResponseDataDto>;

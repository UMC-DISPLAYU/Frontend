import type { ApiResponseDto, CursorPageInfoDto, CursorPageRequestDto } from './common.dto';

export interface LoungeWriterDto {
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface CreateLoungePostRequestDto {
  title: string;
  postImageUrls: string[];
  content: string;
  category: string;
}

export interface LoungePostBaseDto {
  loungePostId: number;
  title: string;
  postImageUrls: string[];
  content: string;
  category: string;
  postStatus: string;
}

export interface GetLoungePostsRequestDto extends CursorPageRequestDto {
  category?: string;
}

export interface LoungePostSummaryDto {
  loungePostId: number;
  category: string;
  title: string;
  content: string;
  postImageUrls: string[];
  writer: LoungeWriterDto;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  isMyPost: boolean;
}

export interface GetLoungePostsResponseDataDto extends CursorPageInfoDto {
  posts: LoungePostSummaryDto[];
}

export type GetLoungePostsResponseDto = ApiResponseDto<GetLoungePostsResponseDataDto>;

export interface LoungePostDetailDto extends LoungePostBaseDto {
  writer: LoungeWriterDto;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  isScrapped: boolean;
  isMyPost: boolean;
}

export type CreateLoungePostResponseDataDto = LoungePostDetailDto;

export type CreateLoungePostResponseDto = ApiResponseDto<CreateLoungePostResponseDataDto>;

export type GetLoungePostDetailResponseDto = ApiResponseDto<LoungePostDetailDto>;

export type UpdateLoungePostRequestDto = CreateLoungePostRequestDto;

export type UpdateLoungePostResponseDataDto = LoungePostDetailDto;

export type UpdateLoungePostResponseDto = ApiResponseDto<UpdateLoungePostResponseDataDto>;

export type DeleteLoungePostResponseDataDto = null;

export type DeleteLoungePostResponseDto = ApiResponseDto<DeleteLoungePostResponseDataDto>;

export interface CreateLoungeCommentRequestDto {
  content: string;
}

export interface LoungeCommentBaseDto {
  loungeCommentId: number;
  parentCommentId: number | null;
  content: string;
  commentStatus: string;
  writer: LoungeWriterDto;
}

export interface LoungeCommentDto extends LoungeCommentBaseDto {
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  isMyComment: boolean;
}

export type CreateLoungeCommentResponseDataDto = LoungeCommentDto;

export type CreateLoungeCommentResponseDto = ApiResponseDto<CreateLoungeCommentResponseDataDto>;

export interface GetLoungeCommentsResponseDataDto extends CursorPageInfoDto {
  comments: LoungeCommentDto[];
}

export type GetLoungeCommentsResponseDto = ApiResponseDto<GetLoungeCommentsResponseDataDto>;

export interface UpdateLoungeCommentRequestDto {
  content: string;
}

export type UpdateLoungeCommentResponseDataDto = LoungeCommentDto;

export type UpdateLoungeCommentResponseDto = ApiResponseDto<UpdateLoungeCommentResponseDataDto>;

export type DeleteLoungeCommentResponseDataDto = null;

export type DeleteLoungeCommentResponseDto = ApiResponseDto<DeleteLoungeCommentResponseDataDto>;

export interface LoungePostLikeStatusDto {
  loungePostId: number;
  isLiked: boolean;
  likeCount: number;
}

export type LikeLoungePostResponseDto = ApiResponseDto<LoungePostLikeStatusDto>;

export type UnlikeLoungePostResponseDto = ApiResponseDto<LoungePostLikeStatusDto>;

export interface LoungeCommentLikeStatusDto {
  loungeCommentId: number;
  isLiked: boolean;
  likeCount: number;
}

export type LikeLoungeCommentResponseDto = ApiResponseDto<LoungeCommentLikeStatusDto>;

export type UnlikeLoungeCommentResponseDto = ApiResponseDto<LoungeCommentLikeStatusDto>;

export interface LoungePostScrapStatusDto {
  loungePostId: number;
  isScrapped: boolean;
  scrapCount: number;
}

export type ScrapLoungePostResponseDto = ApiResponseDto<LoungePostScrapStatusDto>;

export type UnscrapLoungePostResponseDto = ApiResponseDto<LoungePostScrapStatusDto>;

export type CreateLoungeReplyRequestDto = CreateLoungeCommentRequestDto;

export type CreateLoungeReplyResponseDataDto = LoungeCommentDto;

export type CreateLoungeReplyResponseDto = ApiResponseDto<CreateLoungeReplyResponseDataDto>;

export interface LoungeReplyDto extends LoungeCommentBaseDto {
  parentCommentId: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  isMyComment: boolean;
}

export interface GetLoungeRepliesResponseDataDto extends CursorPageInfoDto {
  replies: LoungeReplyDto[];
}

export type GetLoungeRepliesResponseDto = ApiResponseDto<GetLoungeRepliesResponseDataDto>;

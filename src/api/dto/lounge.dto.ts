import type { ApiResponseDto, CursorPageInfoDto, CursorPageRequestDto } from './common.dto';

export interface LoungeWriterDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface CreateLoungePostRequestDto {
  title: string;
  content: string;
  category: string;
}

export interface LoungePostBaseDto {
  loungePostId: number;
  title: string;
  postImageUrl: string | null;
  content: string;
  category: string;
  postStatus: string;
}

export interface CreateLoungePostResponseDataDto extends LoungePostBaseDto {
  createdAt: string;
}

export type CreateLoungePostResponseDto = ApiResponseDto<CreateLoungePostResponseDataDto>;

export interface GetLoungePostsRequestDto extends CursorPageRequestDto {
  category?: string;
}

export interface LoungePostSummaryDto {
  loungePostId: number;
  category: string;
  title: string;
  postImageUrl: string | null;
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

export type GetLoungePostDetailResponseDto = ApiResponseDto<LoungePostDetailDto>;

export interface UpdateLoungePostRequestDto {
  title?: string;
  postImageUrl?: string | null;
  content?: string;
  category?: string;
}

export interface UpdateLoungePostResponseDataDto extends LoungePostBaseDto {
  updatedAt: string;
}

export type UpdateLoungePostResponseDto = ApiResponseDto<UpdateLoungePostResponseDataDto>;

export interface DeleteLoungePostResponseDataDto {
  loungePostId: number;
  postStatus: string;
  deletedAt: string;
}

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

export interface CreateLoungeCommentResponseDataDto extends LoungeCommentBaseDto {
  createdAt: string;
}

export type CreateLoungeCommentResponseDto = ApiResponseDto<CreateLoungeCommentResponseDataDto>;

export interface LoungeCommentDto extends LoungeCommentBaseDto {
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  isMyComment: boolean;
}

export interface GetLoungeCommentsResponseDataDto extends CursorPageInfoDto {
  comments: LoungeCommentDto[];
}

export type GetLoungeCommentsResponseDto = ApiResponseDto<GetLoungeCommentsResponseDataDto>;

export interface UpdateLoungeCommentRequestDto {
  content: string;
}

export interface UpdateLoungeCommentResponseDataDto {
  loungeCommentId: number;
  content: string;
  commentStatus: string;
  updatedAt: string;
}

export type UpdateLoungeCommentResponseDto = ApiResponseDto<UpdateLoungeCommentResponseDataDto>;

export interface DeleteLoungeCommentResponseDataDto {
  loungeCommentId: number;
  commentStatus: string;
  deletedAt: string;
}

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

export interface CreateLoungeReplyResponseDataDto extends LoungeCommentBaseDto {
  parentCommentId: number;
  createdAt: string;
}

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

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
  postImageUrls?: string[];
}

export interface LoungePostBaseDto {
  loungePostId: number;
  title: string;
  postImageUrls: string[];
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

export type GetLoungePostDetailResponseDto = ApiResponseDto<LoungePostDetailDto>;

export interface UpdateLoungePostRequestDto {
  title?: string;
  postImageUrls?: string[];
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
  imageUrls?: string[];
}

export interface LoungeCommentBaseDto {
  loungeCommentId: number;
  parentCommentId: number | null;
  content: string;
  commentStatus: string;
  writer: LoungeWriterDto;
  imageUrls: string[];
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

// ─── 내 활동 (PR #258, 아직 미배포) ────────────────────────────────────────────

export type GetMyLoungePostsResponseDataDto = GetLoungePostsResponseDataDto;

export type GetMyLoungePostsResponseDto = ApiResponseDto<GetMyLoungePostsResponseDataDto>;

export type GetMyLoungeScrapsResponseDataDto = GetLoungePostsResponseDataDto;

export type GetMyLoungeScrapsResponseDto = ApiResponseDto<GetMyLoungeScrapsResponseDataDto>;

export interface LoungeMyCommentDto {
  loungeCommentId: number;
  loungePostId: number;
  parentCommentId: number | null;
  content: string;
  imageUrls: string[];
  commentStatus: string;
  writer: LoungeWriterDto;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  isMyComment: boolean;
}

export interface GetMyLoungeCommentsResponseDataDto extends CursorPageInfoDto {
  comments: LoungeMyCommentDto[];
}

export type GetMyLoungeCommentsResponseDto = ApiResponseDto<GetMyLoungeCommentsResponseDataDto>;

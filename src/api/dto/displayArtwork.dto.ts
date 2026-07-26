import type {
  ApiResponseDto,
  CursorPageInfoDto,
  ImageRequestDto,
  ImageResponseDto,
  OffsetPageRequestDto,
} from './common.dto';

export interface ArtworkImageDto extends ImageResponseDto {
  isThumbnail: boolean;
}

export interface ArtworkGuestbookUserDto {
  userId: number;
  nickname: string;
}

export interface ArtworkGuestbookReplyDto {
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
  isCreator: boolean;
}

export interface ArtworkQuestionReplyDto {
  creatorName: string;
  isCreator: boolean;
  content: string;
  createdAt: string;
}

export interface GetArtworkDetailResponseDataDto {
  artworkId: number;
  artworkName: string;
  content: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size: string;
  point: string;
  images: ImageResponseDto[];
  artistName: string;
  artistUserId: number;
  exhibitionInfo: ArtworkPreviewExhibitionInfoDto;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export type GetArtworkDetailResponseDto = ApiResponseDto<GetArtworkDetailResponseDataDto>;

export interface ArtworkFeelingDto {
  feelingId: number;
  content: string;
  createdAt: string;
  user: ArtworkGuestbookUserDto;
  replies: ArtworkGuestbookReplyDto[];
}

export interface GetArtworkFeelingsResponseDataDto extends CursorPageInfoDto {
  feelings: ArtworkFeelingDto[];
}

export type GetArtworkFeelingsResponseDto = ApiResponseDto<GetArtworkFeelingsResponseDataDto>;

export interface CreateArtworkFeelingRequestDto {
  content: string;
}

export interface CreateArtworkFeelingResponseDataDto {
  feelingId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export type CreateArtworkFeelingResponseDto = ApiResponseDto<CreateArtworkFeelingResponseDataDto>;

export interface UpdateArtworkFeelingRequestDto {
  content: string;
}

export interface UpdateArtworkFeelingResponseDataDto {
  feelingId: number;
  content: string;
  updatedAt: string;
}

export type UpdateArtworkFeelingResponseDto = ApiResponseDto<UpdateArtworkFeelingResponseDataDto>;

export interface DeleteArtworkFeelingResponseDataDto {
  feelingId: number;
  deletedAt: string;
}

export type DeleteArtworkFeelingResponseDto = ApiResponseDto<DeleteArtworkFeelingResponseDataDto>;

export interface ArtworkQuestionDto {
  questionId: number;
  content: string;
  isPublic: boolean;
  answerStatus: string;
  createdAt: string;
  user: ArtworkGuestbookUserDto;
  reply: ArtworkQuestionReplyDto | null;
}

export interface GetArtworkQuestionsResponseDataDto extends CursorPageInfoDto {
  questions: ArtworkQuestionDto[];
}

export type GetArtworkQuestionsResponseDto = ApiResponseDto<GetArtworkQuestionsResponseDataDto>;

export interface CreateArtworkQuestionRequestDto {
  content: string;
  isPublic: boolean;
}

export interface ArtworkQuestionRecordDto {
  artQueId: number;
  content: string;
  isPublic: boolean;
  answerStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  displayArtworkId: number;
  userId: number;
}

export type CreateArtworkQuestionResponseDto = ApiResponseDto<ArtworkQuestionRecordDto>;

export interface UpdateArtworkQuestionRequestDto {
  content: string;
  isPublic: boolean;
}

export type UpdateArtworkQuestionResponseDto = ApiResponseDto<ArtworkQuestionRecordDto>;

export interface DeleteArtworkQuestionResponseDataDto {
  artQueId: number;
  deletedAt: string;
}

export type DeleteArtworkQuestionResponseDto = ApiResponseDto<DeleteArtworkQuestionResponseDataDto>;

export interface CreateArtworkQuestionReplyRequestDto {
  content: string;
}

export interface CreateArtworkQuestionReplyResponseDataDto {
  queReplyId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  artQueId: number;
  creatorId: number;
  creatorName: string;
}

export type CreateArtworkQuestionReplyResponseDto =
  ApiResponseDto<CreateArtworkQuestionReplyResponseDataDto>;

export interface ArtworkFeelingLikeDto {
  feelingId: number;
  liked: boolean;
  likeCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateArtworkFeelingReplyRequestDto {
  content: string;
}

export interface CreateArtworkFeelingReplyResponseDataDto {
  feelingReplyId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  feelingId: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
}

export interface DisplayArtworkLikeResponseDataDto {
  artworkId: number;
  isLiked: boolean;
  likeCount: number;
}

export type DisplayArtworkLikeResponseDto = ApiResponseDto<DisplayArtworkLikeResponseDataDto>;

export type CreateArtworkFeelingReplyResponseDto =
  ApiResponseDto<CreateArtworkFeelingReplyResponseDataDto>;

export type ToggleArtworkFeelingLikeResponseDto = ApiResponseDto<ArtworkFeelingLikeDto>;

export interface UpdateArtworkOrderRequestDto {
  displayId: number;
  orderedArtworkIds: number[];
}

export interface UpdateArtworkOrderResponseDataDto {
  displayId: number;
  updatedCount: number;
}

export type UpdateArtworkOrderResponseDto = ApiResponseDto<UpdateArtworkOrderResponseDataDto>;

export interface CreateExhibitionArtworkRequestDto {
  displayId: number;
  artworkName: string;
  content: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size: string;
  point: string;
  images: ImageRequestDto[];
  artistName: string;
  artistUserId: number;
  coAuthors: ArtworkCoAuthorsDto;
  qaHandlerUserId: number;
}

export interface CreateExhibitionArtworkResponseDataDto {
  artworkId: number;
  displayId: number;
  artworkName: string;
  content: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size: string;
  point: string;
  workSortOrder: number;
  images: ImageResponseDto[];
  artistName: string;
  artistUserId: number;
  coAuthorCount: number;
  qaHandlerUserId: number;
}

export type CreateExhibitionArtworkResponseDto =
  ApiResponseDto<CreateExhibitionArtworkResponseDataDto>;

export interface ArtworkCoAuthorsDto {
  userIds?: number[];
  rawNames?: string[];
}

export interface DeleteArtworkResponseDataDto {
  deletedArtworkId: number;
  message: string;
}

export type DeleteArtworkResponseDto = ApiResponseDto<DeleteArtworkResponseDataDto>;

export interface GetArtworkPreviewRequestDto extends Partial<OffsetPageRequestDto> {
  type: string;
  field?: string;
  school?: string;
}

export interface ArtworkPreviewExhibitionInfoDto {
  displayId: number;
  exhibitionTitle: string;
  exhibitionPeriod: string;
  exhibitionLocation: string;
}

export interface ArtworkPreviewItemDto {
  artworkId: number;
  artworkName: string;
  artistName: string;
  artworkImageUrl: string;
  imageWidth: number;
  imageHeight: number;
  exhibitionInfo: ArtworkPreviewExhibitionInfoDto;
}

export interface GetArtworkPreviewResponseDataDto {
  artworks: ArtworkPreviewItemDto[];
  page: number;
  size: number;
  isLast: boolean;
}

export type GetArtworkPreviewResponseDto = ApiResponseDto<GetArtworkPreviewResponseDataDto>;

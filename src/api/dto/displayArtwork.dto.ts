import type {
  ApiResponseDto,
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
  isCreator?: boolean;
  profileImageUrl?: string | null;
}

export interface ArtworkGuestbookReplyDto {
  feelingReplyId?: number;
  questionReplyId?: number;
  queReplyId?: number;
  questionId?: number;
  content: string;
  createdAt: string;
  user?: ArtworkGuestbookUserDto;
  likeCount?: number;
  isLiked?: boolean;
  /* 질문 답변(작가 답변)은 user 대신 이 필드들로 내려온다. */
  creatorId?: number;
  creatorName?: string;
  isCreator?: boolean;
  userId?: number;
  nickname?: string;
  isTeamMember?: boolean;
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
  qaHandlers?: ArtworkQaHandlerDto[];
  // 공동 작업자. 서버가 아직 내려주지 않아 없으면 공동 작업자 없음으로 취급합니다.
  coAuthorUserIds?: number[];
  exhibitionInfo: ArtworkPreviewExhibitionInfoDto;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export interface ArtworkQaHandlerDto {
  userId: number;
  name: string;
}

export type GetArtworkDetailResponseDto = ApiResponseDto<GetArtworkDetailResponseDataDto>;

export interface ArtworkFeelingDto {
  feelingId: number;
  userId?: number;
  content: string;
  createdAt: string;
  isDeleted?: boolean;
  isMine?: boolean;
  user: ArtworkGuestbookUserDto;
  images?: ImageResponseDto[];
  likeCount: number;
  isLiked?: boolean;
  replyCount: number;
}

export interface GetArtworkFeelingsRequestDto {
  cursorId?: number;
}

export interface GetArtworkFeelingsResponseDataDto {
  feelings: ArtworkFeelingDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export type GetArtworkFeelingsResponseDto = ApiResponseDto<GetArtworkFeelingsResponseDataDto>;

export interface CreateArtworkFeelingRequestDto {
  content: string;
  images?: ArtworkFeelingImageRequestDto[];
}

export interface ArtworkFeelingImageRequestDto {
  imageUrl: string;
  width?: number;
  height?: number;
  sortOrder?: number;
}

export interface CreateArtworkFeelingResponseDataDto {
  feelingId: number;
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

export type DeleteArtworkFeelingResponseDto = ApiResponseDto<null>;

export interface MyArtworkFeelingDto {
  artworkId: number | null;
  personalArtworkId: number | null;
  artworkName: string;
  content: string;
  createdAt: string;
}

export interface GetMyArtworkFeelingsResponseDataDto {
  feelings: MyArtworkFeelingDto[];
  nextCursor: string | null;
  size: number;
  hasNext: boolean;
}

export type GetMyArtworkFeelingsResponseDto = ApiResponseDto<GetMyArtworkFeelingsResponseDataDto>;

export interface ArtworkQuestionDto {
  questionId: number;
  content: string;
  isPublic: boolean;
  answerStatus?: 'WAITING' | 'ANSWERED';
  createdAt: string;
  displayArtworkId?: number;
  userId?: number;
  user: ArtworkGuestbookUserDto;
  reply: ArtworkGuestbookReplyDto | null;
}

export interface GetArtworkQuestionsResponseDataDto {
  questions: ArtworkQuestionDto[];
}

export type GetArtworkQuestionsResponseDto = ApiResponseDto<GetArtworkQuestionsResponseDataDto>;

export interface MyArtworkQuestionDto {
  questionId: number | null;
  personalQuestionId: number | null;
  artworkId: number | null;
  personalArtworkId: number | null;
  artworkName: string;
  content: string;
  isPublic: boolean;
  answerStatus: 'WAITING' | 'ANSWERED';
  createdAt: string;
}

export interface GetMyArtworkQuestionsResponseDataDto {
  questions: MyArtworkQuestionDto[];
  nextCursor: string | null;
  size: number;
  hasNext: boolean;
}

export type GetMyArtworkQuestionsResponseDto = ApiResponseDto<GetMyArtworkQuestionsResponseDataDto>;

export interface ReceivedArtworkQuestionDto {
  questionId: number;
  personalQuestionId: number | null;
  artworkId: number;
  personalArtworkId: number | null;
  artworkName: string;
  content: string;
  isPublic: boolean;
  answerStatus: 'WAITING' | 'ANSWERED';
  questionerId: number;
  questionerNickname: string;
  createdAt: string;
}

export interface GetReceivedArtworkQuestionsResponseDataDto {
  questions: ReceivedArtworkQuestionDto[];
  nextCursor: string | null;
  size: number;
  hasNext: boolean;
}

export type GetReceivedArtworkQuestionsResponseDto = ApiResponseDto<GetReceivedArtworkQuestionsResponseDataDto>;

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
  questionId: number;
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
  questionId: number;
  creatorId: number;
  creatorName: string;
}

export type CreateArtworkQuestionReplyResponseDto =
  ApiResponseDto<CreateArtworkQuestionReplyResponseDataDto>;

export interface DeleteArtworkQuestionReplyResponseDataDto {
  questionReplyId: number;
  deletedAt: string;
}

export type DeleteArtworkQuestionReplyResponseDto =
  ApiResponseDto<DeleteArtworkQuestionReplyResponseDataDto>;

export interface ArtworkFeelingLikeDto {
  feelingId: number;
  liked: boolean;
  likeCount: number;
}

export type ToggleArtworkFeelingLikeResponseDto = ApiResponseDto<ArtworkFeelingLikeDto | null>;

export interface ArtworkFeelingReplyListResponseDataDto {
  replies: ArtworkGuestbookReplyDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export interface ArtworkFeelingReplyLikeDto {
  feelingReplyId: number;
  liked: boolean;
  likeCount: number;
}

export interface DeleteArtworkFeelingReplyResponseDataDto {
  feelingReplyId: number;
  deletedAt: string;
}

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
  artistName?: string;
  artistUserId?: number;
  coAuthors: ArtworkCoAuthorsDto;
  /* 담당자는 여러 명 지정할 수 있고 최소 한 명은 있어야 합니다. */
  qaHandlerUserIds: number[];
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
  userIds: number[];
  rawNames: string[];
}

export interface DeleteArtworkResponseDataDto {
  deletedArtworkId: number;
  message: string;
}

export type DeleteArtworkResponseDto = ApiResponseDto<DeleteArtworkResponseDataDto>;

export interface GetArtworkPreviewRequestDto extends Partial<OffsetPageRequestDto> {
  type?: string;
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

export interface DisplayArtworkDto {
  artworkId: number;
  artworkName: string;
  artistName: string;
  artistUserId?: number;
  coAuthorUserIds?: number[];
  artworkImageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export interface GetDisplayArtworksResponseDataDto {
  artworks: DisplayArtworkDto[];
}

export type GetDisplayArtworksResponseDto = ApiResponseDto<GetDisplayArtworksResponseDataDto>;

// 가짜 DTO: 백엔드에 내 작품 전체 조회 API가 생기면 스웨거 기준 DTO로 교체해야 합니다.
export interface MyArtworkDto {
  artworkId: number;
  artworkName: string;
  artistName: string;
  artworkImageUrl: string;
  displayId: number;
  displayTitle: string;
}

// 가짜 DTO: 백엔드에 내 작품 전체 조회 API가 생기면 스웨거 기준 DTO로 교체해야 합니다.
export interface GetMyArtworksResponseDataDto {
  artworks: MyArtworkDto[];
}

export type GetMyArtworksResponseDto = ApiResponseDto<GetMyArtworksResponseDataDto>;

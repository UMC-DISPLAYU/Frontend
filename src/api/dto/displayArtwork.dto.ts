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
  images?: ArtworkFeelingReplyImageDto[];
  /* 질문 답변(작가 답변)은 user 대신 이 필드들로 내려온다. */
  creatorId?: number;
  creatorName?: string;
  isCreator?: boolean;
  userId?: number;
  nickname?: string;
  isTeamMember?: boolean;
}

export interface ArtworkFeelingReplyImageDto {
  feelingReplyImageId: number;
  imageUrl: string;
  width: number;
  height: number;
  sortOrder: number;
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
  /* 공동 작업자. 계정이 연결되지 않은 공동 작업자는 userId가 null입니다. */
  coAuthors?: ArtworkCoAuthorDto[];
  exhibitionInfo: ArtworkDetailExhibitionInfoDto;
  likeCount: number;
  isLiked: boolean;
  isArchived: boolean;
}

export interface ArtworkDetailExhibitionInfoDto {
  displayId: number;
  exhibitionTitle: string;
  exhibitionSubtitle: string | null;
  exhibitionThumbnailUrl: string;
  exhibitionOrganizer: string;
  exhibitionPeriod: string;
  exhibitionLocation: string;
}

export interface ArtworkQaHandlerDto {
  userId: number;
  name: string;
}

export interface ArtworkCoAuthorDto {
  userId: number | null;
  name: string;
}

export type GetArtworkDetailResponseDto = ApiResponseDto<GetArtworkDetailResponseDataDto>;

export interface ArtworkFeelingImageDto {
  feelingImageId: number;
  imageUrl: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface ArtworkFeelingDto {
  feelingId: number;
  userId?: number;
  content: string;
  createdAt: string;
  isDeleted?: boolean;
  isMine?: boolean;
  user: ArtworkGuestbookUserDto;
  images?: ArtworkFeelingImageDto[];
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

export interface ArtworkFeelingReplyImageRequestDto {
  imageUrl: string;
  width?: number;
  height?: number;
}

export interface CreateArtworkFeelingResponseDataDto {
  feelingId: number;
  content: string;
  createdAt: string;
}

export type CreateArtworkFeelingResponseDto = ApiResponseDto<CreateArtworkFeelingResponseDataDto>;

export interface CreateArtworkFeelingReplyResponseDataDto {
  feelingReplyId: number;
  content: string;
  createdAt: string;
  feelingId: number;
  userId: number;
  nickname: string;
  images?: ArtworkFeelingReplyImageDto[];
}

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
  /* 비공개 질문을 볼 권한이 없으면 content/user/reply/likeCount가 모두 null로 마스킹됩니다. */
  content: string | null;
  isPublic: boolean;
  /* 질문/답변 원문을 조회할 권한이 있는지. 서버가 계산해서 내려줍니다. */
  accessible: boolean;
  /* 로그인 사용자가 이 질문에 답변을 등록할 수 있는지. 서버가 계산해서 내려줍니다. */
  canReply: boolean;
  likeCount: number | null;
  answerStatus?: 'WAITING' | 'ANSWERED';
  createdAt: string;
  displayArtworkId?: number;
  userId?: number;
  images?: { imageUrl: string; width?: number; height?: number }[];
  user: ArtworkGuestbookUserDto | null;
  reply: ArtworkGuestbookReplyDto | null;
}

export interface GetArtworkQuestionsResponseDataDto {
  questions: ArtworkQuestionDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
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

export type GetReceivedArtworkQuestionsResponseDto =
  ApiResponseDto<GetReceivedArtworkQuestionsResponseDataDto>;

export interface CreateArtworkQuestionRequestDto {
  content: string;
  isPublic: boolean;
  images?: ArtworkFeelingReplyImageRequestDto[];
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

export interface DeleteArtworkQuestionResponseDataDto {
  questionId: number;
  deletedAt: string;
}

export type DeleteArtworkQuestionResponseDto = ApiResponseDto<DeleteArtworkQuestionResponseDataDto>;

export interface CreateArtworkQuestionReplyRequestDto {
  content: string;
  images?: ArtworkFeelingReplyImageRequestDto[];
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
  types?: string[];
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

export type UpdateExhibitionArtworkRequestDto = Partial<CreateExhibitionArtworkRequestDto>;

export interface CreateExhibitionArtworkResponseDataDto {
  artworkId: number;
  displayId: number;
  artworkName: string;
  content: string;
  type: string;
  types?: string[];
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
  field?: string;
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
  displayId?: number;
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

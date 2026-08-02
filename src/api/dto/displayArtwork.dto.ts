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
}

export interface ArtworkGuestbookReplyDto {
  feelingReplyId?: number;
  questionReplyId?: number;
  content: string;
  createdAt: string;
  userId?: number;
  nickname?: string;
  isCreator?: boolean;
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
  exhibitionInfo: ArtworkPreviewExhibitionInfoDto;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export type GetArtworkDetailResponseDto = ApiResponseDto<GetArtworkDetailResponseDataDto>;

export interface ArtworkFeelingDto {
  feelingId: number;
  userId?: number;
  content: string;
  createdAt: string;
  user: ArtworkGuestbookUserDto;
  images?: ImageResponseDto[];
  reply: ArtworkGuestbookReplyDto | null;
}

export interface GetArtworkFeelingsResponseDataDto {
  feelings: ArtworkFeelingDto[];
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

export interface ArtworkQuestionDto {
  questionId: number;
  content: string;
  isPublic: boolean;
  createdAt: string;
  user: ArtworkGuestbookUserDto;
  reply: ArtworkGuestbookReplyDto | null;
}

export interface GetArtworkQuestionsResponseDataDto {
  questions: ArtworkQuestionDto[];
}

export type GetArtworkQuestionsResponseDto = ApiResponseDto<GetArtworkQuestionsResponseDataDto>;

// 가짜 DTO: 백엔드에 내 작품 질문 조회 API가 생기기 전까지 답변할 질문 화면에서 사용합니다.
export interface MyArtworkQuestionDto {
  questionId: number;
  artworkId: number;
  artworkName: string;
  content: string;
  answerStatus: 'PENDING' | 'ANSWERED';
  isPublic: boolean;
  createdAt: string;
  user: ArtworkGuestbookUserDto;
}

// 가짜 DTO: GET /api/v1/artworks/question/me 응답 데이터입니다.
export interface GetMyArtworkQuestionsResponseDataDto {
  questions: MyArtworkQuestionDto[];
}

// 가짜 DTO: GET /api/v1/artworks/question/me API 응답입니다.
export type GetMyArtworkQuestionsResponseDto = ApiResponseDto<GetMyArtworkQuestionsResponseDataDto>;

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
  id2: number;
  createrId: number;
}

export type CreateArtworkQuestionReplyResponseDto =
  ApiResponseDto<CreateArtworkQuestionReplyResponseDataDto>;

export interface ArtworkFeelingLikeDto {
  artLikeId: number;
  createdAt: string;
  id2: number;
  userId: number;
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
  isLiked: boolean;
  likeCount: number;
}

export interface DeleteArtworkFeelingReplyResponseDataDto {
  feelingReplyId: number;
  deletedAt: string;
}

export interface UpdateArtworkOrderRequestDto {
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

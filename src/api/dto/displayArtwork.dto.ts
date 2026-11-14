import type { ApiResponseDto, ImageResponseDto, OffsetPageRequestDto } from './common.dto';

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
  content: string;
  createdAt: string;
  user?: ArtworkGuestbookUserDto;
  likeCount?: number;
  isLiked?: boolean;
  images?: ArtworkFeelingReplyImageDto[];
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

/* 작품분야 서버 enum. 작품 등록 · 수정 · 개인 작품이 같은 값을 쓴다 */
export type ArtworkTypeDto =
  | 'PAINTING'
  | 'DESIGN'
  | 'PHOTOGRAPHY'
  | 'ARCHITECTURE'
  | 'MEDIA'
  | 'CRAFT'
  | 'SCULPTURE'
  | 'FASHION'
  | 'COMPLEX'
  | 'ETC';

export interface ArtworkImageRequestDto {
  imageUrl: string;
  isThumbnail?: boolean;
  /* 사진 · 영상 구분 없이 작품 이미지(ARTWORK)와 작업 과정(WORK_PROCESS)만 나눈다 */
  imageType: 'ARTWORK' | 'WORK_PROCESS';
  sortOrder?: number;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CreateExhibitionArtworkRequestDto {
  displayId: number;
  artworkName: string;
  content?: string;
  type?: ArtworkTypeDto;
  /* 서버가 최대 2개까지 받는다 */
  types?: ArtworkTypeDto[];
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  images: ArtworkImageRequestDto[];
  artistName: string;
  artistUserId?: number;
  coAuthors: ArtworkCoAuthorsDto;
  /* 담당자는 여러 명 지정할 수 있고 최소 한 명은 있어야 합니다. */
  qaHandlerUserIds: number[];
}

export type UpdateExhibitionArtworkRequestDto = Omit<
  CreateExhibitionArtworkRequestDto,
  'displayId'
>;

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
  qaHandlerUserIds: number[];
}

/* 수정 화면 진입 시 등록 당시 상태(공동 작가 · Q&A 담당자 포함)를 복원하는 응답 */
export interface DisplayArtworkEditResponseDataDto {
  artworkId: number;
  displayId: number;
  artworkName: string;
  content?: string | null;
  type?: string | null;
  types?: string[] | null;
  productionYear: number;
  materialMedia: string;
  size?: string | null;
  point?: string | null;
  images: ImageResponseDto[];
  artistName: string;
  artistUserId?: number | null;
  coAuthors?: ArtworkCoAuthorDto[] | null;
  qaHandlerUserIds?: number[] | null;
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
  /* 대표 작가가 첫 번째이고 공동 작가가 이어진다 */
  artists?: ArtworkCoAuthorDto[];
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

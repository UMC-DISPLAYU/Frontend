import type { ApiResponseDto, ImageResponseDto, OffsetPageRequestDto } from './common.dto';
import type { ImageFitDto, MediaTypeDto } from './file.dto';

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
  materialMedia: string | null;
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

/* 개인 작품 분야 서버 enum(예전 10개) */
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

/*
 * 전시 작품 분야. 새로 고를 수 있는 값은 앞의 12개이고,
 * 뒤의 예전 값은 이미 저장된 분야를 수정 요청에 그대로 다시 보낼 때만 받는다
 */
export type DisplayArtworkTypeDto =
  | 'PAINTING'
  | 'SCULPTURE'
  | 'PHOTOGRAPHY'
  | 'GRAPHIC'
  | 'BRANDING'
  | 'PRODUCT'
  | 'VIDEO'
  | 'SPACE'
  | 'ARCHITECTURE'
  | 'UX_UI'
  | 'CRAFTS'
  | 'OTHERS'
  | 'DESIGN'
  | 'FASHION'
  | 'COMPLEX'
  | 'ILLUSTRATION'
  | 'MEDIA'
  | 'CRAFT'
  | 'ETC'
  | 'UXUI';

/* 카드 썸네일에 보이는 영역. 대표 사진 전체를 1로 본 비율(0~1) */
export interface ArtworkCropDto {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ArtworkImageRequestDto {
  imageUrl: string;
  isThumbnail?: boolean;
  /* 작품 이미지(ARTWORK)와 작업 과정(WORK_PROCESS)을 나눈다. 작업 과정은 사진만 받는다 */
  imageType: 'ARTWORK' | 'WORK_PROCESS';
  sortOrder?: number;
  caption?: string;
  /* 영상이면 썸네일 크기 */
  width?: number;
  height?: number;
  /* 전시 작품만 받는다. 생략하면 IMAGE */
  mediaType?: MediaTypeDto;
  /* VIDEO 일 때 필수인 썸네일 이미지 주소 */
  thumbnailUrl?: string;
}

export interface CreateExhibitionArtworkRequestDto {
  displayId: number;
  artworkName: string;
  content?: string;
  type?: DisplayArtworkTypeDto;
  /* 서버가 최대 3개까지 받는다 */
  types?: DisplayArtworkTypeDto[];
  productionYear: number;
  /* 비우면(빈 문자열 포함) 저장된 재료 / 매체가 지워진다 */
  materialMedia?: string;
  size?: string;
  point?: string;
  images: ArtworkImageRequestDto[];
  artistName: string;
  artistUserId?: number;
  coAuthors: ArtworkCoAuthorsDto;
  /* 담당자는 여러 명 지정할 수 있고 최소 한 명은 있어야 합니다. */
  qaHandlerUserIds: number[];
  /* 수정에서 생략하면 대표 사진이 같은 동안 기존 영역을 유지하고, 대표 사진이 바뀌면 지워진다 */
  artworkCrop?: ArtworkCropDto | null;
  /* 백엔드 확인 전: 대표 사진 보이는 방식. artworkCrop 과 같이 생략하면 유지하고, 대표 사진이 바뀌면 지워진다 */
  artworkFit?: ImageFitDto | null;
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
  materialMedia: string | null;
  size: string;
  point: string;
  workSortOrder: number;
  images: ImageResponseDto[];
  artistName: string;
  artistUserId: number;
  coAuthorCount: number;
  qaHandlerUserIds: number[];
  artworkCrop?: ArtworkCropDto | null;
  artworkFit?: ImageFitDto | null;
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
  materialMedia: string | null;
  size?: string | null;
  point?: string | null;
  images: ImageResponseDto[];
  artistName: string;
  artistUserId?: number | null;
  coAuthors?: ArtworkCoAuthorDto[] | null;
  qaHandlerUserIds?: number[] | null;
  artworkCrop?: ArtworkCropDto | null;
  artworkFit?: ImageFitDto | null;
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
  artworkCrop?: ArtworkCropDto | null;
  artworkFit?: ImageFitDto | null;
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
  artistUserId?: number | null;
  /* 대표 · 공동 작가 중 계정이 있는 사람의 id. 계정 없는 작가와 Q&A 전용 담당자는 빠진다 */
  artistUserIds?: number[];
  /* 대표 작가가 첫 번째이고 공동 작가가 이어진다. 대표 작가 자리도 userId 가 null 일 수 있다 */
  artists?: ArtworkCoAuthorDto[];
  artworkImageUrl: string;
  imageWidth: number;
  imageHeight: number;
  artworkCrop?: ArtworkCropDto | null;
  artworkFit?: ImageFitDto | null;
  /* 대표가 영상이면 영상 주소(artworkImageUrl 은 썸네일), 아니면 null */
  artworkVideoUrl?: string | null;
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

/* GET /v1/artworks/search: 탐색 작품 탭. type · status 는 작품이 속한 전시 기준이다 */
export interface SearchArtworksRequestDto {
  /* 작품명 · 대표 · 공동 작가명 */
  searchWord?: string | null;
  type?: string | null;
  status?: string | null;
  page?: number;
  size: number;
}

/* 응답 카드는 작품 미리보기와 같은 형식이다 */
export type ArtworkSearchItemDto = ArtworkPreviewItemDto;

export type SearchArtworksResponseDataDto = GetArtworkPreviewResponseDataDto;

export type SearchArtworksResponseDto = ApiResponseDto<SearchArtworksResponseDataDto>;

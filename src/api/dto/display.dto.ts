import type { ApiResponseDto, OffsetPageInfoDto, OffsetPageRequestDto } from './common.dto';

export interface HomeExhibitionDto {
  displayId: number;
  title: string;
  posterImageUrl: string;
  isBookmarked: boolean;
  startedAt: string;
  endedAt: string;
}

export interface ClosingSoonExhibitionDto extends HomeExhibitionDto {
  dayLeft?: number;
}

export interface GetClosingSoonDisplaysRequestDto {
  cursor?: string;
  size?: number;
}

export interface GetGraduationDisplaysResponseDataDto {
  exhibitions: HomeExhibitionDto[];
}

export type GetGraduationDisplaysResponseDto = ApiResponseDto<GetGraduationDisplaysResponseDataDto>;

export interface ClosingSoonPaginationDto {
  nextCursor: string | null;
  size: number;
  hasNext: boolean;
}

export interface GetClosingSoonDisplaysResponseDataDto {
  exhibitions: ClosingSoonExhibitionDto[];
  pagination: ClosingSoonPaginationDto;
}

export type GetClosingSoonDisplaysResponseDto =
  ApiResponseDto<GetClosingSoonDisplaysResponseDataDto>;

export interface DuPickDto {
  duPickId: number;
  title: string;
  subtitle: string;
  bannerImageUrl: string;
  createdAt: string;
}

export interface GetDuPicksRequestDto {
  cursor?: number | null;
  size?: number;
}

export interface DuPickPaginationDto {
  nextCursor: number | null;
  size: number;
  hasNext: boolean;
}

export interface GetDuPicksResponseDataDto {
  duPicks: DuPickDto[];
  pagination: DuPickPaginationDto;
}

export type GetDuPicksResponseDto = ApiResponseDto<GetDuPicksResponseDataDto>;

export interface DisplayListItemDto {
  displayId: number;
  title: string;
  host: string;
  period: string;
  location: string;
  posterImageUrl: string;
  isBookmarked: boolean;
}

export interface GetDisplaysRequestDto extends Partial<OffsetPageRequestDto> {
  searchWord?: string | null;
  status?: string | null;
  region?: string | null;
  field?: string | null;
  type?: string | null;
}

//나머지는 선택이고 필수
export interface SearchDisplaysRequestDto extends OffsetPageRequestDto {
  searchWord?: string | null;
  status?: string | null;
  region?: string | null;
  field?: string | null;
  type?: string | null;
}

//
export interface DisplayListResponseDataDto extends OffsetPageInfoDto {
  exhibitions: DisplayListItemDto[];
}

export type GetDisplaysResponseDto = ApiResponseDto<DisplayListResponseDataDto>;

export type SearchDisplaysResponseDto = ApiResponseDto<DisplayListResponseDataDto>;

export interface GetDisplayMapRequestDto {
  swLatitude: number;
  swLongitude: number;
  neLatitude: number;
  neLongitude: number;
  searchWord?: string;
}

export interface DisplayMapMarkerDto {
  displayId: number;
  title: string;
  period: string;
  locationName: string;
  posterImageUrl: string;
  latitude: number;
  longitude: number;
  isBookmarked: boolean;
}

export interface GetDisplayMapResponseDataDto {
  markers: DisplayMapMarkerDto[];
}

export type GetDisplayMapResponseDto = ApiResponseDto<GetDisplayMapResponseDataDto>;

export interface DisplayDetailDto {
  displayId: number;
  title: string;
  hostName: string;
  posterImageUrl: string;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  period: string;
  location: string;
}

export type GetDisplayDetailResponseDto = ApiResponseDto<DisplayDetailDto>;

export interface DisplayArtworkListItemDto {
  artworkId: number;
  artworkName: string;
  authorName: string;
  thumbnailImageUrl: string;
}

export interface GetDisplayArtworksRequestDto extends OffsetPageRequestDto {
  sort?: string;
}

export interface GetDisplayArtworksResponseDataDto extends OffsetPageInfoDto {
  displayId: number;
  totalCount: number;
  artworks: DisplayArtworkListItemDto[];
}

export type GetDisplayArtworksResponseDto = ApiResponseDto<GetDisplayArtworksResponseDataDto>;

export interface CreateDisplayRequestDto {
  title: string;
  posterImageUrl: string;
  type: string;
  fields: string[];
  schoolOrOrganization: string | null;
  departmentOrClub: string | null;
  hostOrganizationName: string | null;
  subtitle: string | null;
  description: string | null;
}

export interface CreateDisplayResponseDataDto extends CreateDisplayRequestDto {
  displayId: number;
  status: string;
}

export type CreateDisplayResponseDto = ApiResponseDto<CreateDisplayResponseDataDto>;

export interface UpdateDisplayDetailsRequestDto {
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  locationName: string;
  roadAddress: string;
  precautions: string | null;
}

export interface UpdateDisplayDetailsResponseDataDto extends UpdateDisplayDetailsRequestDto {
  displayId: number;
  title: string;
  status: string;
}

export type UpdateDisplayDetailsResponseDto = ApiResponseDto<UpdateDisplayDetailsResponseDataDto>;

export interface CreateDisplayAuthorRequestDto {
  authorName: string;
}

export interface CreateDisplayAuthorResponseDataDto {
  displayId: number;
  authorId: number;
  authorName: string;
}

export type CreateDisplayAuthorResponseDto = ApiResponseDto<CreateDisplayAuthorResponseDataDto>;

export interface UpdateDisplayVisibilityRequestDto {
  artworkVisibility: string;
  contentVisibility: string;
}

export interface UpdateDisplayVisibilityResponseDataDto extends UpdateDisplayVisibilityRequestDto {
  displayId: number;
}

export type UpdateDisplayVisibilityResponseDto =
  ApiResponseDto<UpdateDisplayVisibilityResponseDataDto>;

export interface PublishDisplayResponseDataDto {
  displayId: number;
  status: string;
}

export type PublishDisplayResponseDto = ApiResponseDto<PublishDisplayResponseDataDto>;

export interface UpdateDisplayRequestDto {
  title?: string;
  posterImageUrl?: string;
  type?: string;
  fields?: string[];
  schoolOrOrganization?: string | null;
  departmentOrClub?: string | null;
  hostOrganizationName?: string | null;
  subtitle?: string | null;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  openTime?: string;
  closeTime?: string;
  location?: string;
  locationDetails?: string;
  precautions?: string | null;
}

export interface UpdateDisplayResponseDataDto {
  displayId: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  posterImageUrl: string;
  type: string;
  fields: string[];
  schoolOrOrganization: string | null;
  departmentOrClub: string | null;
  hostOrganizationName: string | null;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  location: string;
  precautions: string | null;
  status: string;
}

export type UpdateDisplayResponseDto = ApiResponseDto<UpdateDisplayResponseDataDto>;

export interface DeleteDisplayResponseDataDto {
  displayId: number;
  isDeleted: boolean;
}

export type DeleteDisplayResponseDto = ApiResponseDto<DeleteDisplayResponseDataDto>;

export interface ToggleDisplayLikeResponseDataDto {
  displayId: number;
  isLiked: boolean;
  likeCount: number;
}

export type ToggleDisplayLikeResponseDto = ApiResponseDto<ToggleDisplayLikeResponseDataDto>;

export interface DisplayReviewDto {
  reviewId: number;
  writerNickname: string;
  writerProfileImageUrl: string;
  score: number;
  content: string;
  createdAt: string;
  isMyReview: boolean;
}

export interface GetDisplayReviewsResponseDataDto extends OffsetPageInfoDto {
  reviews: DisplayReviewDto[];
}

export type GetDisplayReviewsResponseDto = ApiResponseDto<GetDisplayReviewsResponseDataDto>;

export interface CreateDisplayReviewRequestDto {
  score: number;
  content: string;
}

export interface CreateDisplayReviewResponseDataDto extends DisplayReviewDto {
  displayId: number;
}

export type CreateDisplayReviewResponseDto = ApiResponseDto<CreateDisplayReviewResponseDataDto>;

export interface UpdateDisplayReviewRequestDto {
  score?: number;
  content?: string;
}

export interface UpdateDisplayReviewResponseDataDto extends DisplayReviewDto {
  displayId: number;
}

export type UpdateDisplayReviewResponseDto = ApiResponseDto<UpdateDisplayReviewResponseDataDto>;

export interface DeleteDisplayReviewResponseDataDto {
  reviewId: number;
  isDeleted: boolean;
}

export type DeleteDisplayReviewResponseDto = ApiResponseDto<DeleteDisplayReviewResponseDataDto>;

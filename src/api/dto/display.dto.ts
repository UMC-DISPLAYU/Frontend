import type { ApiResponseDto, CursorPaginationDto, OffsetPageRequestDto } from './common.dto';

export interface HomeExhibitionDto {
  displayId: number;
  title: string;
  posterImageUrl: string;
  organization?: string;
  department?: string;
  startedAt: string;
  endedAt: string;
  dayLeft?: number;
}

export type ClosingSoonExhibitionDto = HomeExhibitionDto;

export interface GetClosingSoonDisplaysRequestDto {
  cursor?: string;
  size?: number;
}

export interface GetGraduationDisplaysResponseDataDto {
  exhibitions: HomeExhibitionDto[];
}

export type GetGraduationDisplaysResponseDto = ApiResponseDto<GetGraduationDisplaysResponseDataDto>;

export interface GetClosingSoonDisplaysResponseDataDto {
  exhibitions: ClosingSoonExhibitionDto[];
  pagination: CursorPaginationDto<string>;
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

export interface GetDuPicksResponseDataDto {
  duPicks: DuPickDto[];
  pagination: CursorPaginationDto<number>;
}

export type GetDuPicksResponseDto = ApiResponseDto<GetDuPicksResponseDataDto>;

export interface DisplayListItemDto {
  displayId: number;
  title: string;
  posterImageUrl: string;
  organization?: string;
  department?: string;
  startedAt: string;
  endedAt: string;
  dayLeft?: number;
}

export interface GetDisplaysRequestDto extends Partial<OffsetPageRequestDto> {
  searchWord?: string | null;
  status?: string | null;
  region?: string | null;
  field?: string | null;
  type?: string | null;
}

//나머지는 선택이고 필수
export interface SearchDisplaysRequestDto {
  searchWord?: string | null;
  status?: string | null;
  region?: string | null;
  field?: string | null;
  type?: string | null;
  cursor: number;
  size: number;
}

//
export interface DisplayListResponseDataDto {
  exhibitions: DisplayListItemDto[];
  pagination: CursorPaginationDto<number>;
}

export type GetDisplaysResponseDto = ApiResponseDto<DisplayListResponseDataDto>;

export type SearchDisplaysResponseDto = ApiResponseDto<DisplayListResponseDataDto>;

export interface GetDisplayMapRequestDto {
  southLatitude: number;
  westLongitude: number;
  northLatitude: number;
  eastLongitude: number;
  searchWord?: string;
  cursor?: number;
  size?: number;
}

export interface DisplayMapMarkerDto {
  displayId: number;
  title: string;
  startDate: string;
  endDate: string;
  locationName: string;
  posterImageUrl: string;
  latitude: number;
  longitude: number;
}

export interface GetDisplayMapResponseDataDto {
  markers: DisplayMapMarkerDto[];
  pagination: CursorPaginationDto<number>;
}

export type GetDisplayMapResponseDto = ApiResponseDto<GetDisplayMapResponseDataDto>;

export interface DisplayDetailDto {
  displayId: number;
  ownerUserId: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  location: DisplayLocationDto;
  qnaAccount: string;
  note: string | null;
  organization: string | null;
  department: string | null;
  displayType: string;
  displayFields: string[];
  region: string;
  likeCount: number;
  period: DisplayPeriodDto;
  artworkContentOpen: string;
  exhibitionContentOpen: string;
  status: string;
  invitationToken: string | null;
  invitationDisabledAt: string | null;
  images: DisplayImageDto[];
  contentCategories: DisplayContentCategoryDto[];
  teamMembers: DisplayTeamMemberDto[];
  invitations: DisplayInvitationDto[];
}

export interface DisplayLocationDto {
  placeName: string;
  latitude: number;
  longitude: number;
}

export interface DisplayPeriodDto {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface DisplayImageDto {
  imageId: number;
  imageUrl: string;
  imageType: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface DisplayContentDto {
  contentId: number;
  imageUrl: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface DisplayContentCategoryDto {
  categoryId: number;
  name: string;
  description: string | null;
  sortOrder: number;
  contents: DisplayContentDto[];
}

export interface DisplayTeamMemberDto {
  teamMemberId: number;
  userId: number;
  displayNickname: string;
  role: string;
  accepted: boolean;
}

export interface DisplayInvitationDto {
  invitationId: number;
  inviterUserId: number;
  inviteeUserId: number;
  createdAt: string;
}

export type GetDisplayDetailResponseDto = ApiResponseDto<DisplayDetailDto>;

export interface DisplayArtworkListItemDto {
  artworkId: number;
  artworkName: string;
  artistName: string;
  artworkImageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export interface GetDisplayArtworksRequestDto {
  displayId: number;
}

export interface GetDisplayArtworksResponseDataDto {
  artworks: DisplayArtworkListItemDto[];
}

export type GetDisplayArtworksResponseDto = ApiResponseDto<GetDisplayArtworksResponseDataDto>;

export interface CreateDisplayRequestDto {
  title: string;
  posterImageUrl: string;
  type: string;
  fields: string[];
  region: string;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  roadAddress: string;
  schoolOrOrganization?: string;
  departmentOrClub?: string;
  hostOrganizationName?: string;
  subtitle?: string;
  description?: string;
  precautions?: string;
  regionValid?: boolean;
  schoolOrOrganizationValid?: boolean;
  departmentOrClubValid?: boolean;
  hostOrganizationNameValid?: boolean;
}

export type CreateDisplayResponseDataDto = DisplayDetailDto;

export type CreateDisplayResponseDto = ApiResponseDto<CreateDisplayResponseDataDto>;

export interface UpdateDisplayRequestDto {
  displayId: number;
  title?: string;
  posterImageUrl?: string;
  type?: string;
  fields?: string[];
  schoolOrOrganization?: string;
  departmentOrClub?: string;
  hostOrganizationName?: string;
  subtitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  openTime?: string;
  closeTime?: string;
  placeName?: string;
  precautions?: string;
  fieldsValid?: boolean;
}

export type UpdateDisplayResponseDataDto = DisplayDetailDto;

export type UpdateDisplayResponseDto = ApiResponseDto<UpdateDisplayResponseDataDto>;

export interface DeleteDisplayResponseDataDto {
  displayId: number;
  isDeleted: boolean;
}

export type DeleteDisplayResponseDto = ApiResponseDto<DeleteDisplayResponseDataDto>;

export interface ToggleDisplayLikeResponseDataDto {
  displayId: number;
  likeCount: number;
}

export type ToggleDisplayLikeResponseDto = ApiResponseDto<ToggleDisplayLikeResponseDataDto>;

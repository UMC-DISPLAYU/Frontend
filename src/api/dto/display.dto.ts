import type {
  ApiResponseDto,
  CursorPaginationDto,
  ImageResponseDto,
  OffsetPageRequestDto,
} from './common.dto';

export interface HomeExhibitionDto {
  displayId: number;
  title: string;
  posterImageUrl: string;
  organization: string;
  department: string;
  schoolDepartmentName?: string;
  startedAt: string;
  endedAt: string;
  dayLeft?: number;
  isArchived?: boolean;
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
  startedAt: string;
  endedAt: string;
  dayLeft?: number;
  isArchived: boolean;
  schoolDepartmentName?: string;
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
  schoolDepartmentName?: string;
  isArchived?: boolean;
}

export interface GetDisplayMapResponseDataDto {
  markers: DisplayMapMarkerDto[];
  pagination: CursorPaginationDto<number>;
}

export type GetDisplayMapResponseDto = ApiResponseDto<GetDisplayMapResponseDataDto>;

/*
 * 공개 시점은 전시 상세 조회로 읽고, 수정은 예약 API로 보냅니다.
 * 숨김(HIDDEN)은 서버가 아직 지원하지 않아 요청 값에서 제외합니다.
 */
export type DisplayContentOpenType = 'IMMEDIATELY' | 'ON_EXHIBITION';

export interface DisplayDetailDto {
  displayId: number;
  ownerUserId: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  location: DisplayLocationDto;
  qnaAccount: string;
  contract: string | null;
  note: string | null;
  organization: string | null;
  department: string | null;
  displayType: string;
  displayFields: string[];
  region: string;
  likeCount: number;
  isArchived?: boolean;
  period: DisplayPeriodDto;
  artworkContentOpen: DisplayContentOpenType;
  exhibitionContentOpen: DisplayContentOpenType;
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
  roadAddress: string;
}

export interface DisplayPeriodDto {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export type DisplayImageDto = ImageResponseDto;

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
  authorName: string;
  thumbnailImageUrl: string;
}

export interface GetDisplayArtworksRequestDto extends OffsetPageRequestDto {
  sort?: string;
}

// ─── 전시 후기 DTO ──────────────────────────────────────────────────────────

export interface DisplayReviewUserDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface DisplayReviewImageDto {
  personalFeelingImageId: number;
  imageUrl: string;
  width: number;
  height: number;
  sortOrder: number;
}

export interface DisplayReviewDto {
  displayReviewId: number;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  isMine: boolean;
  user: DisplayReviewUserDto;
  images: DisplayReviewImageDto[];
  likeCount: number;
  isLiked: boolean;
  replyCount: number;
}

export interface GetDisplayReviewsRequestDto {
  cursorId?: number;
  size?: number;
}

export interface CreateDisplayReviewRequestDto {
  content: string;
  images?: DisplayReviewImageRequestDto[];
}

export interface DisplayReviewImageRequestDto {
  imageUrl: string;
  width?: number;
  height?: number;
  sortOrder?: number;
}

export type CreateDisplayReviewResponseDataDto = DisplayReviewDto;

export interface DeleteDisplayReviewResponseDataDto {
  displayReviewId: number;
  deletedAt: string;
}

export interface DisplayReviewLikeResponseDataDto {
  displayReviewId: number;
  liked: boolean;
  likeCount: number;
  createdAt?: string;
  deletedAt?: string;
}

export interface GetDisplayReviewsResponseDataDto {
  reviews: DisplayReviewDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export interface DisplayReviewReplyUserDto {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface DisplayReviewReplyImageDto {
  imageUrl: string;
  width?: number;
  height?: number;
  sortOrder?: number;
}

export interface DisplayReviewReplyDto {
  displayReviewReplyId: number;
  content: string;
  createdAt: string;
  user: DisplayReviewReplyUserDto;
  isTeamMember: boolean;
  likeCount: number;
  isLiked: boolean;
  images?: DisplayReviewReplyImageDto[];
}

export interface GetDisplayReviewRepliesRequestDto {
  cursorId?: number;
  size?: number;
}

export interface CreateDisplayReviewReplyRequestDto {
  content: string;
  images?: DisplayReviewImageRequestDto[];
}

export type CreateDisplayReviewReplyResponseDataDto = DisplayReviewReplyDto;

export interface DeleteDisplayReviewReplyResponseDataDto {
  displayReviewReplyId: number;
  deletedAt: string;
}

export interface DisplayReviewReplyLikeResponseDataDto {
  displayReviewReplyId: number;
  liked: boolean;
  likeCount: number;
  createdAt?: string;
  deletedAt?: string;
}

export interface GetDisplayReviewRepliesResponseDataDto {
  replies: DisplayReviewReplyDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export interface MyDisplayReviewDto {
  displayReviewId: number;
  displayId: number;
  displayName: string;
  content: string;
  createdAt: string;
}

export interface GetMyDisplayReviewsResponseDataDto {
  reviews: MyDisplayReviewDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export type GetMyDisplayReviewsResponseDto = ApiResponseDto<GetMyDisplayReviewsResponseDataDto>;

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
  /* 서버 필수값입니다. 이 전시에서 쓸 표시명과 문의(Q&A) 계정입니다. */
  displayNickname: string;
  qnaAccount: string;
  schoolOrOrganization: string;
  departmentOrClub?: string;
  subtitle?: string;
  description?: string;
  precautions?: string | null;
  departmentOrClubValid?: boolean;
  regionValid?: boolean;
}

export type CreateDisplayResponseDataDto = DisplayDetailDto;

export type CreateDisplayResponseDto = ApiResponseDto<CreateDisplayResponseDataDto>;

export interface UpdateDisplayRequestDto {
  displayId?: number;
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
  placeName?: string;
  precautions?: string | null;
  fieldsValid?: boolean;
}

export type UpdateDisplayResponseDataDto = DisplayDetailDto;

export type UpdateDisplayResponseDto = ApiResponseDto<UpdateDisplayResponseDataDto>;

export interface UpdateDisplayReservationRequestDto {
  artworkContentOpen: DisplayContentOpenType;
  exhibitionContentOpen: DisplayContentOpenType;
}

export type UpdateDisplayReservationResponseDataDto = DisplayDetailDto;

export type UpdateDisplayReservationResponseDto =
  ApiResponseDto<UpdateDisplayReservationResponseDataDto>;

export interface DeleteDisplayResponseDataDto {
  displayId: number;
  isDeleted: boolean;
}

export type DeleteDisplayResponseDto = ApiResponseDto<DeleteDisplayResponseDataDto>;

/* 스웨거 응답은 displayId와 likeCount만 담깁니다. 좋아요 여부는 요청 종류로 판단합니다. */
export interface ToggleDisplayLikeResponseDataDto {
  displayId: number;
  isLiked?: boolean;
  likeCount: number;
}

export type ToggleDisplayLikeResponseDto = ApiResponseDto<ToggleDisplayLikeResponseDataDto>;

export interface DisplayLikeStatusResponseDataDto {
  isLiked: boolean;
}

export type DisplayLikeStatusResponseDto = ApiResponseDto<DisplayLikeStatusResponseDataDto>;

export interface MyDisplayDto {
  displayId: number;
  title: string;
  displayStatus: string;
  startDate: string;
  endDate: string;
  school: string;
  department: string;
  placeName: string;
  postImageUrl: string;
  isLeader?: boolean;
  publishedStatus?: 'PUBLISHED' | 'DRAFT';
}

export interface GetMyDisplaysResponseDataDto {
  createdDisplays: MyDisplayDto[];
  participatedDisplays: MyDisplayDto[];
}

export type ArtistDisplayDto = MyDisplayDto;

export interface GetArtistDisplaysResponseDataDto {
  createdDisplays: ArtistDisplayDto[];
  participatedDisplays: ArtistDisplayDto[];
}

export interface InviteDisplayMemberRequestDto {
  inviteeUserId: number;
  role?: 'TEAM_MEM';
}

export interface DisplayMemberListResponseDataDto {
  displayId: number;
  members: DisplayTeamMemberDto[];
}

export interface DisplayMemberInvitationResponseDataDto {
  invitationId: number;
  displayId: number;
  inviterUserId: number;
  inviteeUserId: number;
  status: string;
  createdAt: string;
  respondedAt?: string | null;
}

/* POST /display/{displayId}/invitation — 서버가 완성된 초대 URL을 그대로 내려줍니다. */
export interface CreateDisplayInvitationLinkResponseDataDto {
  displayId: number;
  invitationUrl: string;
}

/* PATCH /display/{displayId}/invitation/disable */
export interface DisableDisplayInvitationLinkResponseDataDto {
  displayId: number;
  invitationDisabledAt: string;
}

export interface MyDisplayInvitationListResponseDataDto {
  invitations: DisplayInvitationDto[];
}

export interface AcceptDisplayInvitationRequestDto {
  displayNickname: string;
}

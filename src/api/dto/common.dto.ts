//공통 메타 정보
export interface ApiMetaDto {
  timestamp: string;
  path: string;
}

//에러 정보 구조
export interface ApiErrorDto {
  code: string;
  message: string;
  details: string | null;
}

//성공 응답 구조
export interface ApiSuccessResponseDto<TData> {
  resultType: 'SUCCESS';
  success: {
    data: TData;
  };
  error: null;
  meta: ApiMetaDto;
}

//실패 응답 구조
export interface ApiErrorResponseDto {
  resultType: 'FAIL';
  success: null;
  error: ApiErrorDto;
  meta: ApiMetaDto;
}

export type ApiResponseDto<TData> = ApiSuccessResponseDto<TData> | ApiErrorResponseDto;

// page/size 기반 페이지네이션 요청
export interface OffsetPageRequestDto {
  page: number;
  size: number;
}

// page/size 기반 페이지네이션 응답
export interface OffsetPageInfoDto {
  page: number;
  size: number;
  isLast: boolean;
}

// currentPage/pageSize 기반 페이지네이션 응답
export interface CurrentPageInfoDto {
  currentPage: number;
  pageSize: number;
  isLast: boolean;
}

// cursor 기반 페이지네이션 요청
export interface CursorPageRequestDto {
  cursorId?: number | null;
  size?: number;
}

// cursor 기반 페이지네이션 응답
export interface CursorPageInfoDto {
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export interface CursorPaginationDto<TCursor = number | string> {
  nextCursor: TCursor | null;
  size: number;
  hasNext: boolean;
}

export interface ImageRequestDto {
  imageUrl: string;
  isThumbnail?: boolean;
  imageType: string;
  sortOrder?: number;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ImageResponseDto {
  imageId: number;
  imageUrl: string;
  isThumbnail: boolean;
  imageType: string;
  caption: string;
  width: number;
  height: number;
  sortOrder: number;
}

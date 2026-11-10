/* 카카오 로컬 주소 검색 응답(필요한 필드만). https://developers.kakao.com/docs/latest/ko/local/dev-guide */
export interface KakaoAddressDocumentDto {
  address_name: string;
  x: string;
  y: string;
  address: {
    address_name: string;
    region_3depth_name: string;
  } | null;
  road_address: {
    address_name: string;
    building_name: string;
    zone_no: string;
  } | null;
}

export interface KakaoAddressSearchResponseDto {
  documents: KakaoAddressDocumentDto[];
  meta: { total_count: number; is_end: boolean };
}

export interface AddressSearchResultDto {
  id: string;
  zipCode: string;
  roadAddress: string;
  roadAddressDetail: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
}

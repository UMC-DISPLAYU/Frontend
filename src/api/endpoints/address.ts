import type {
  AddressSearchResultDto,
  KakaoAddressDocumentDto,
  KakaoAddressSearchResponseDto,
} from '../dto';

const KAKAO_ADDRESS_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/address.json';

export const toAddressSearchResult = (
  document: KakaoAddressDocumentDto,
  index: number,
): AddressSearchResultDto => {
  const road = document.road_address;
  const extras = [document.address?.region_3depth_name, road?.building_name].filter(Boolean);

  return {
    id: `${document.x},${document.y},${index}`,
    zipCode: road?.zone_no ?? '',
    roadAddress: road?.address_name ?? '',
    roadAddressDetail: extras.length > 0 ? `(${extras.join(', ')})` : '',
    jibunAddress: document.address?.address_name ?? document.address_name,
    latitude: Number(document.y),
    longitude: Number(document.x),
  };
};

// GET https://dapi.kakao.com/v2/local/search/address.json
// 우리 서버가 아닌 카카오 API 라 apiRequest(토큰 · 응답 형식 처리)를 쓰지 않는다
export const searchAddress = async (
  query: string,
  signal?: AbortSignal,
): Promise<AddressSearchResultDto[]> => {
  const params = new URLSearchParams({ query, analyze_type: 'similar', size: '30' });
  const response = await fetch(`${KAKAO_ADDRESS_SEARCH_URL}?${params}`, {
    headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}` },
    signal,
  });

  if (!response.ok) throw new Error('주소를 검색하지 못했어요');

  const data: KakaoAddressSearchResponseDto = await response.json();
  return data.documents.map(toAddressSearchResult);
};

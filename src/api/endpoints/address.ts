import type {
  AddressSearchResultDto,
  KakaoAddressDocumentDto,
  KakaoAddressSearchResponseDto,
  KakaoKeywordDocumentDto,
  KakaoKeywordSearchResponseDto,
} from '../dto';

const KAKAO_LOCAL_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search';

const toAddressKey = (result: Pick<AddressSearchResultDto, 'roadAddress' | 'jibunAddress'>) =>
  result.roadAddress || result.jibunAddress;

export const toAddressSearchResult = (
  document: KakaoAddressDocumentDto,
): AddressSearchResultDto => {
  const road = document.road_address;
  const extras = [document.address?.region_3depth_name, road?.building_name].filter(Boolean);
  const result = {
    zipCode: road?.zone_no ?? '',
    roadAddress: road?.address_name ?? '',
    roadAddressDetail: extras.length > 0 ? `(${extras.join(', ')})` : '',
    jibunAddress: document.address?.address_name ?? document.address_name,
    latitude: Number(document.y),
    longitude: Number(document.x),
  };

  return { id: toAddressKey(result), ...result };
};

const toPlaceAddressResult = (place: KakaoKeywordDocumentDto): AddressSearchResultDto => {
  const result = {
    zipCode: '',
    roadAddress: place.road_address_name,
    roadAddressDetail: '',
    jibunAddress: place.address_name,
    latitude: Number(place.y),
    longitude: Number(place.x),
  };

  return { id: toAddressKey(result), ...result };
};

// 도로명 · 동만 있는 결과(ROAD · REGION)는 건물번호가 없어 전시 주소로 고를 수 없다
const isBuildingAddress = (document: KakaoAddressDocumentDto) =>
  document.address_type === 'ROAD_ADDR' || document.address_type === 'REGION_ADDR';

// 우리 서버가 아닌 카카오 API 라 apiRequest(토큰 · 응답 형식 처리)를 쓰지 않는다
const kakaoLocalSearch = async <T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(`${KAKAO_LOCAL_SEARCH_URL}/${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}` },
    signal,
  });

  if (!response.ok) throw new Error('주소를 검색하지 못했어요');
  return response.json();
};

// GET https://dapi.kakao.com/v2/local/search/address.json
const searchKakaoAddress = (
  query: string,
  options: { analyzeType: 'similar' | 'exact'; size: number },
  signal?: AbortSignal,
) =>
  kakaoLocalSearch<KakaoAddressSearchResponseDto>(
    'address.json',
    { query, analyze_type: options.analyzeType, size: String(options.size) },
    signal,
  );

// GET https://dapi.kakao.com/v2/local/search/keyword.json
const searchKakaoKeyword = (query: string, signal?: AbortSignal) =>
  kakaoLocalSearch<KakaoKeywordSearchResponseDto>('keyword.json', { query, size: '15' }, signal);

// 키워드 결과에는 우편번호 · 건물명이 없어 주소로 한 번 더 찾는다. 못 찾으면 키워드 결과 주소를 그대로 쓴다
const lookupPlaceAddress = async (
  place: KakaoKeywordDocumentDto,
  signal?: AbortSignal,
): Promise<AddressSearchResultDto> => {
  const data = await searchKakaoAddress(
    toAddressKey(toPlaceAddressResult(place)),
    { analyzeType: 'exact', size: 1 },
    signal,
  ).catch(() => null);
  const document = data?.documents.find(isBuildingAddress);

  return document ? toAddressSearchResult(document) : toPlaceAddressResult(place);
};

// 키워드 결과에는 상호명만 비슷한 다른 동네 가게도 섞여서, 검색어가 주소 · 건물명에 모두 들어 있는 결과를 앞에 둔다
const matchesAllTerms = (result: AddressSearchResultDto, terms: string[]) => {
  const text = `${result.roadAddress}${result.roadAddressDetail}${result.jibunAddress}`.replace(
    /\s/g,
    '',
  );
  return terms.every((term) => text.includes(term));
};

/**
 * juso.go.kr 처럼 도로명 · 지번 · 건물명 어느 것으로도 찾을 수 있게 주소 검색과 키워드(장소) 검색을 합친다.
 * 주소 검색 결과를 앞에 두고, 같은 주소는 한 번만 보인다.
 */
export const searchAddress = async (
  query: string,
  signal?: AbortSignal,
): Promise<AddressSearchResultDto[]> => {
  const [addressData, keywordData] = await Promise.all([
    searchKakaoAddress(query, { analyzeType: 'similar', size: 30 }, signal),
    searchKakaoKeyword(query, signal),
  ]);

  const addressResults = addressData.documents.filter(isBuildingAddress).map(toAddressSearchResult);
  const seen = new Set(addressResults.map(toAddressKey));
  const places = keywordData.documents.filter((place) => {
    const key = toAddressKey(toPlaceAddressResult(place));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const terms = query.split(/\s+/).filter(Boolean);
  const placeResults = (
    await Promise.all(places.map((place) => lookupPlaceAddress(place, signal)))
  ).sort((a, b) => Number(matchesAllTerms(b, terms)) - Number(matchesAllTerms(a, terms)));

  const results = new Map<string, AddressSearchResultDto>();
  [...addressResults, ...placeResults].forEach((result) => {
    if (!results.has(result.id)) results.set(result.id, result);
  });
  return [...results.values()];
};

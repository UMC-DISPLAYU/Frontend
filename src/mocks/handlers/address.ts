import { http, HttpResponse } from 'msw';

import type { KakaoAddressDocumentDto, KakaoAddressSearchResponseDto } from '@/api/dto';
import { MOCK_ADDRESS_KEYWORD } from '@/mocks/scenario';

const KAKAO_ADDRESS_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/address.json';

/* 공개된 공공 장소 주소만 쓴다. 좌표는 대략적인 위치다. */
const MOCK_ADDRESS_DOCUMENTS: KakaoAddressDocumentDto[] = [
  {
    address_name: '서울 종로구 삼청로 30',
    x: '126.9800',
    y: '37.5786',
    address: { address_name: '서울 종로구 소격동 165', region_3depth_name: '소격동' },
    road_address: {
      address_name: '서울 종로구 삼청로 30',
      building_name: '국립현대미술관 서울',
      zone_no: '03062',
    },
  },
  {
    address_name: '서울 중구 덕수궁길 61',
    x: '126.9737',
    y: '37.5641',
    address: { address_name: '서울 중구 서소문동 37', region_3depth_name: '서소문동' },
    road_address: {
      address_name: '서울 중구 덕수궁길 61',
      building_name: '서울시립미술관 서소문본관',
      zone_no: '04515',
    },
  },
  {
    address_name: '서울 서초구 남부순환로 2406',
    x: '127.0142',
    y: '37.4783',
    address: { address_name: '서울 서초구 서초동 700', region_3depth_name: '서초동' },
    road_address: {
      address_name: '서울 서초구 남부순환로 2406',
      building_name: '예술의전당',
      zone_no: '06757',
    },
  },
];

// 우리 서버가 아닌 카카오 API 를 직접 부르므로 ApiResponseDto(success) 가 아닌 카카오 원본 형식으로 돌려준다
export const addressHandlers = [
  http.get(KAKAO_ADDRESS_SEARCH_URL, ({ request }) => {
    const query = new URL(request.url).searchParams.get('query') ?? '';
    const documents = query.includes(MOCK_ADDRESS_KEYWORD) ? MOCK_ADDRESS_DOCUMENTS : [];

    return HttpResponse.json<KakaoAddressSearchResponseDto>({
      documents,
      meta: { total_count: documents.length, is_end: true },
    });
  }),
];

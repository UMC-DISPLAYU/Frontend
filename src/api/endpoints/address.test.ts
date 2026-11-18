import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { KakaoAddressDocumentDto, KakaoKeywordDocumentDto } from '../dto';

import { searchAddress } from './address';

const addressDocument = (
  road: string,
  jibun: string,
  overrides: Partial<KakaoAddressDocumentDto> = {},
): KakaoAddressDocumentDto => ({
  address_name: road,
  address_type: 'ROAD_ADDR',
  x: '127',
  y: '37.5',
  address: { address_name: jibun, region_3depth_name: '다동' },
  road_address: { address_name: road, building_name: '센터플레이스', zone_no: '04522' },
  ...overrides,
});

const place = (placeName: string, road: string, jibun: string): KakaoKeywordDocumentDto => ({
  place_name: placeName,
  road_address_name: road,
  address_name: jibun,
  x: '127',
  y: '37.5',
});

const mockKakao = ({
  address = [],
  keyword = [],
  lookup = {},
}: {
  address?: KakaoAddressDocumentDto[];
  keyword?: KakaoKeywordDocumentDto[];
  lookup?: Record<string, KakaoAddressDocumentDto>;
}) => {
  const fetchMock = vi.fn(async (input: string) => {
    const url = new URL(input);
    const query = url.searchParams.get('query') ?? '';
    const isLookup = url.searchParams.get('analyze_type') === 'exact';
    const documents = url.pathname.endsWith('keyword.json')
      ? keyword
      : isLookup
        ? [lookup[query]].filter(Boolean)
        : address;

    return new Response(JSON.stringify({ documents, meta: { total_count: 0, is_end: true } }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('searchAddress', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_KAKAO_REST_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('건물번호가 없는 도로명 · 동 결과는 뺀다', async () => {
    mockKakao({
      address: [
        addressDocument('서울 중구 다동', '서울 중구 다동', {
          address_type: 'REGION',
          road_address: null,
        }),
        addressDocument('서울 중구 남대문로9길 40', '서울 중구 다동 155'),
      ],
    });

    const results = await searchAddress('다동');

    expect(results.map((result) => result.roadAddress)).toEqual(['서울 중구 남대문로9길 40']);
    expect(results[0]).toMatchObject({
      zipCode: '04522',
      roadAddressDetail: '(다동, 센터플레이스)',
      jibunAddress: '서울 중구 다동 155',
    });
  });

  it('같은 주소의 키워드 결과는 한 번만 보이고, 주소 검색 결과를 앞에 둔다', async () => {
    mockKakao({
      address: [addressDocument('서울 중구 남대문로9길 40', '서울 중구 다동 155')],
      keyword: [
        place('GS25 무교점', '서울 중구 남대문로9길 40', '서울 중구 다동 155'),
        place('을밀대', '서울 중구 남대문로9길 40', '서울 중구 다동 155'),
        place('다동빌딩', '서울 중구 다동길 46', '서울 중구 다동 92'),
      ],
      lookup: {
        '서울 중구 다동길 46': addressDocument('서울 중구 다동길 46', '서울 중구 다동 92'),
      },
    });

    const results = await searchAddress('다동');

    expect(results.map((result) => result.roadAddress)).toEqual([
      '서울 중구 남대문로9길 40',
      '서울 중구 다동길 46',
    ]);
  });

  it('키워드 결과는 주소로 다시 찾아 우편번호 · 건물명을 채우고, 못 찾으면 키워드 주소를 쓴다', async () => {
    mockKakao({
      keyword: [
        place('국립현대미술관 서울', '서울 종로구 삼청로 30', '서울 종로구 소격동 165'),
        place('이름 없는 땅', '', '서울 서초구 서초동 산 144-4'),
      ],
      lookup: {
        '서울 종로구 삼청로 30': addressDocument(
          '서울 종로구 삼청로 30',
          '서울 종로구 소격동 165',
          {
            address: { address_name: '서울 종로구 소격동 165', region_3depth_name: '소격동' },
            road_address: {
              address_name: '서울 종로구 삼청로 30',
              building_name: '',
              zone_no: '03062',
            },
          },
        ),
      },
    });

    const results = await searchAddress('미술관');

    expect(results).toEqual([
      expect.objectContaining({
        zipCode: '03062',
        roadAddress: '서울 종로구 삼청로 30',
        roadAddressDetail: '(소격동)',
      }),
      expect.objectContaining({
        zipCode: '',
        roadAddress: '',
        jibunAddress: '서울 서초구 서초동 산 144-4',
      }),
    ]);
  });

  it('검색어가 주소 · 건물명에 모두 들어 있는 키워드 결과를 앞에 둔다', async () => {
    mockKakao({
      keyword: [
        place(
          '다동뼈감탕',
          '제주특별자치도 제주시 도남로 118',
          '제주특별자치도 제주시 도남동 746-2',
        ),
        place('다동빌딩', '서울 중구 다동길 46', '서울 중구 다동 92'),
      ],
    });

    const results = await searchAddress('중구 다동');

    expect(results.map((result) => result.roadAddress)).toEqual([
      '서울 중구 다동길 46',
      '제주특별자치도 제주시 도남로 118',
    ]);
  });

  it('카카오 API 가 실패하면 오류를 던진다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 401 })),
    );

    await expect(searchAddress('다동')).rejects.toThrow('주소를 검색하지 못했어요');
  });
});

import { describe, expect, it } from 'vitest';

import {
  type ExhibitionRegisterDraft,
  INITIAL_EXHIBITION_REGISTER_DRAFT,
} from '@/contexts/exhibitionRegisterDraftState';

import { buildCreateDisplayRequest, toDisplayRegion } from './createDisplayRequest';

const DRAFT: ExhibitionRegisterDraft = {
  ...INITIAL_EXHIBITION_REGISTER_DRAFT,
  posters: ['p0', 'p1', 'p2', 'p3', 'p4'].map((url) => ({
    url,
    mediaType: 'IMAGE' as const,
    thumbnailUrl: null,
  })),
  title: ' 졸업 전시 ',
  intro: '소개',
  type: '졸업 전시',
  field: ['VIDEO', 'GRAPHIC', 'GRAPHIC', 'CRAFT'],
  school: '디유대학교',
  department: '시각디자인과',
  startDate: '2026-11-20',
  endDate: '2026-11-26',
  startTime: '10:00',
  endTime: '18:00',
  placeName: '예술관 1층',
  address: '서울특별시 중구 예술로 12',
  latitude: 37.5,
  longitude: 127,
};

describe('buildCreateDisplayRequest', () => {
  it('draft 를 서버 요청 형식으로 바꾼다', () => {
    expect(buildCreateDisplayRequest(DRAFT, ' 김디유 ')).toEqual({
      title: '졸업 전시',
      posterMedia: { imageUrl: 'p0', mediaType: 'IMAGE' },
      displayMedia: ['p1', 'p2', 'p3', 'p4'].map((imageUrl) => ({ imageUrl, mediaType: 'IMAGE' })),
      type: 'GRADUATION',
      fields: ['VIDEO', 'GRAPHIC', 'CRAFTS'],
      region: 'SEOUL',
      schoolOrOrganization: '디유대학교',
      departmentOrClub: '시각디자인과',
      description: '소개',
      startDate: '2026-11-20',
      endDate: '2026-11-26',
      openTime: '10:00',
      closeTime: '18:00',
      locationName: '예술관 1층',
      roadAddress: '서울특별시 중구 예술로 12',
      latitude: 37.5,
      longitude: 127,
      displayNickname: '김디유',
    });
  });

  it('영상 포스터는 썸네일과 함께 보내고, 이미지에는 썸네일을 붙이지 않는다', () => {
    const request = buildCreateDisplayRequest(
      {
        ...DRAFT,
        posters: [
          { url: 'v0.mp4', mediaType: 'VIDEO', thumbnailUrl: 't0.jpg' },
          { url: 'p1', mediaType: 'IMAGE', thumbnailUrl: null },
        ],
      },
      '김디유',
    );

    expect(request).toMatchObject({
      posterMedia: { imageUrl: 'v0.mp4', mediaType: 'VIDEO', thumbnailUrl: 't0.jpg' },
      displayMedia: [{ imageUrl: 'p1', mediaType: 'IMAGE' }],
    });
    expect(request?.displayMedia?.[0]).not.toHaveProperty('thumbnailUrl');
    expect(request).not.toHaveProperty('posterImageUrl');
    expect(request).not.toHaveProperty('displayImageUrl');
  });

  it('기타 단체 전시는 단체명을 소속으로 보내고 학과는 보내지 않는다', () => {
    const request = buildCreateDisplayRequest(
      { ...DRAFT, type: '기타 단체 전시', school: '', department: '', organizer: '디유 연합' },
      '김디유',
    );

    expect(request).toMatchObject({ type: 'OTHERS', schoolOrOrganization: '디유 연합' });
    expect(request).not.toHaveProperty('departmentOrClub');
  });

  it('링크는 있을 때만 전체 주소로 보낸다', () => {
    expect(buildCreateDisplayRequest(DRAFT, '김디유')).not.toHaveProperty('instagramUrl');
    expect(
      buildCreateDisplayRequest(
        { ...DRAFT, instagramId: 'displayu', websiteUrl: 'https://displayu.kr/' },
        '김디유',
      ),
    ).toMatchObject({
      instagramUrl: 'https://instagram.com/displayu',
      websiteUrl: 'https://displayu.kr/',
    });
  });

  it('포스터 범위는 고른 경우에만 보낸다', () => {
    expect(buildCreateDisplayRequest(DRAFT, '김디유')).not.toHaveProperty('posterCrop');
    expect(
      buildCreateDisplayRequest({ ...DRAFT, posterCrop: { x: 0, y: 0.1, w: 1, h: 0.8 } }, '김디유'),
    ).toMatchObject({ posterCrop: { x: 0, y: 0.1, w: 1, h: 0.8 } });
  });

  it('필수값이 빠지면 null', () => {
    expect(buildCreateDisplayRequest({ ...DRAFT, posters: [] }, '김디유')).toBeNull();
    expect(buildCreateDisplayRequest({ ...DRAFT, latitude: null }, '김디유')).toBeNull();
    expect(buildCreateDisplayRequest(DRAFT, '  ')).toBeNull();
  });
});

describe('toDisplayRegion', () => {
  it('주소로 지역을 나눈다', () => {
    expect(toDisplayRegion('서울특별시 중구')).toBe('SEOUL');
    expect(toDisplayRegion('경기도 성남시')).toBe('GYEONGGI_INCHEON');
    expect(toDisplayRegion('인천광역시 연수구')).toBe('GYEONGGI_INCHEON');
    expect(toDisplayRegion('부산광역시 해운대구')).toBe('OTHERS');
  });
});

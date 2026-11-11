import { describe, expect, it } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';

import {
  buildUpdateDisplayRequest,
  isEditDraftChanged,
  toEditDraft,
  toFieldLabels,
} from './displayEditDraft';

const DETAIL = {
  displayId: 7,
  title: '졸업 전시',
  subtitle: '',
  content: '소개',
  displayType: 'GRADUATION',
  displayFields: ['DESIGN', 'VIDEO', 'FASHION'],
  organization: '디유대학교',
  department: '시각디자인과',
  period: {
    startDate: '2026-11-20',
    endDate: '2026-11-26',
    startTime: '10:00:00',
    endTime: '18:00:00',
  },
  location: {
    placeName: '예술관',
    roadAddress: '서울특별시 중구 예술로 12',
    latitude: 37.5,
    longitude: 127,
  },
  images: [
    { imageUrl: 'p1', sortOrder: 1 },
    { imageUrl: 'p0', sortOrder: 0 },
  ],
  instagramUrl: 'https://www.instagram.com/displayu/',
  websiteUrl: 'https://displayu.kr/',
} as unknown as DisplayDetailDto;

describe('toFieldLabels', () => {
  it('서버 값을 화면 분야 이름으로 바꾸고, 화면에 없는 값은 뺀다', () => {
    expect(toFieldLabels(['DESIGN', 'VIDEO', 'CRAFTS', 'OTHERS', 'FASHION'])).toEqual([
      '그래픽',
      '영상',
      '공예',
      '기타',
    ]);
  });
});

describe('toEditDraft', () => {
  it('화면에 없는 분야는 따로 보존한다', () => {
    expect(toEditDraft(DETAIL)).toMatchObject({
      fieldLabels: ['그래픽', '영상'],
      hiddenServerFields: ['FASHION'],
    });
  });

  it('전시 상세를 수정 화면 값으로 바꾼다', () => {
    expect(toEditDraft(DETAIL)).toMatchObject({
      editDisplayId: 7,
      imageUrls: ['p0', 'p1'],
      title: '졸업 전시',
      intro: '소개',
      type: '졸업 전시',
      fieldLabels: ['그래픽', '영상'],
      field: ['DESIGN', 'VIDEO'],
      school: '디유대학교',
      department: '시각디자인과',
      organizer: '',
      startTime: '10:00',
      endTime: '18:00',
      placeName: '예술관',
      address: '서울특별시 중구 예술로 12',
      instagramId: 'displayu',
      websiteUrl: 'https://displayu.kr/',
    });
  });

  it('기타 단체 전시는 소속을 단체명으로 둔다', () => {
    expect(
      toEditDraft({ ...DETAIL, displayType: 'OTHERS', organization: '디유 연합' }),
    ).toMatchObject({ type: '기타 단체 전시', school: '', department: '', organizer: '디유 연합' });
  });
});

describe('buildUpdateDisplayRequest', () => {
  it('수정 API 가 받는 항목만 담고, 화면에 없는 분야도 그대로 보낸다', () => {
    expect(buildUpdateDisplayRequest(toEditDraft(DETAIL))).toEqual({
      title: '졸업 전시',
      posterImageUrl: 'p0',
      type: 'GRADUATION',
      fields: ['DESIGN', 'VIDEO', 'FASHION'],
      schoolOrOrganization: '디유대학교',
      departmentOrClub: '시각디자인과',
      description: '소개',
      startDate: '2026-11-20',
      endDate: '2026-11-26',
      openTime: '10:00',
      closeTime: '18:00',
      placeName: '예술관',
    });
  });

  it('비운 학과 · 소개는 null 로 보내 지운다', () => {
    const draft = { ...toEditDraft(DETAIL), department: '', intro: ' ' };
    expect(buildUpdateDisplayRequest(draft)).toMatchObject({
      departmentOrClub: null,
      description: null,
    });
  });

  it('필수값이 빠지면 null', () => {
    expect(
      buildUpdateDisplayRequest({ ...toEditDraft(DETAIL), fieldLabels: [], field: [] }),
    ).toBeNull();
  });
});

describe('isEditDraftChanged', () => {
  it('수정할 수 있는 항목이 달라졌을 때만 true', () => {
    const original = toEditDraft(DETAIL);
    expect(isEditDraftChanged(original, { ...original })).toBe(false);
    expect(isEditDraftChanged(original, { ...original, title: '새 제목' })).toBe(true);
    expect(isEditDraftChanged(original, { ...original, fieldLabels: ['영상'] })).toBe(true);
    expect(
      isEditDraftChanged(original, { ...original, posterCrop: { x: 0, y: 0, w: 1, h: 1 } }),
    ).toBe(false);
  });
});

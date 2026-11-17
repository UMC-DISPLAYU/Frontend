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
    { imageUrl: 'p1', sortOrder: 1, mediaType: 'VIDEO', thumbnailUrl: 't1' },
    { imageUrl: 'p0', sortOrder: 0 },
  ],
  instagramUrl: 'https://www.instagram.com/displayu/',
  websiteUrl: 'https://displayu.kr/',
  posterCrop: { x: 0.1, y: 0, w: 0.8, h: 1 },
} as unknown as DisplayDetailDto;

describe('toFieldLabels', () => {
  it('서버 값을 화면 분야 이름으로 바꾸고, 새 목록에서 빠진 예전 분야는 뺀다', () => {
    expect(
      toFieldLabels(['DESIGN', 'GRAPHIC', 'UX_UI', 'VIDEO', 'CRAFTS', 'OTHERS', 'FASHION']),
    ).toEqual(['그래픽', 'UXUI', '영상', '공예', '기타']);
  });

  it('예전 표기는 같은 분야 이름으로 바꾼다', () => {
    expect(toFieldLabels(['CRAFT', 'ETC', 'MEDIA', 'UXUI'])).toEqual([
      '공예',
      '기타',
      '영상',
      'UXUI',
    ]);
  });
});

describe('toEditDraft', () => {
  it('화면에 없는 예전 분야는 따로 보존한다', () => {
    expect(toEditDraft(DETAIL)).toMatchObject({
      fieldLabels: ['영상'],
      hiddenServerFields: ['DESIGN', 'FASHION'],
    });
  });

  it('전시 상세를 수정 화면 값으로 바꾼다', () => {
    expect(toEditDraft(DETAIL)).toMatchObject({
      editDisplayId: 7,
      posters: [
        { url: 'p0', mediaType: 'IMAGE', thumbnailUrl: null },
        { url: 'p1', mediaType: 'VIDEO', thumbnailUrl: 't1' },
      ],
      title: '졸업 전시',
      intro: '소개',
      type: '졸업 전시',
      fieldLabels: ['영상'],
      field: ['VIDEO'],
      school: '디유대학교',
      department: '시각디자인과',
      organizer: '',
      startTime: '10:00',
      endTime: '18:00',
      placeName: '예술관',
      address: '서울특별시 중구 예술로 12',
      instagramId: 'displayu',
      websiteUrl: 'https://displayu.kr/',
      posterCrop: { x: 0.1, y: 0, w: 0.8, h: 1 },
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
      posterMedia: { imageUrl: 'p0', mediaType: 'IMAGE' },
      displayMedia: [{ imageUrl: 'p1', mediaType: 'VIDEO', thumbnailUrl: 't1' }],
      type: 'GRADUATION',
      fields: ['VIDEO', 'DESIGN', 'FASHION'],
      schoolOrOrganization: '디유대학교',
      departmentOrClub: '시각디자인과',
      description: '소개',
      startDate: '2026-11-20',
      endDate: '2026-11-26',
      openTime: '10:00',
      closeTime: '18:00',
      placeName: '예술관',
      roadAddress: '서울특별시 중구 예술로 12',
      latitude: 37.5,
      longitude: 127,
      region: 'SEOUL',
      instagramUrl: 'https://instagram.com/displayu',
      websiteUrl: 'https://displayu.kr/',
      posterCrop: { x: 0.1, y: 0, w: 0.8, h: 1 },
    });
  });

  it('지운 링크는 빈 문자열로 보내 지운다', () => {
    const draft = { ...toEditDraft(DETAIL), instagramId: '', websiteUrl: '' };
    expect(buildUpdateDisplayRequest(draft)).toMatchObject({ instagramUrl: '', websiteUrl: '' });
  });

  it('포스터 범위가 없으면 보내지 않아 서버 값을 유지한다', () => {
    const draft = { ...toEditDraft(DETAIL), posterCrop: null };
    expect(buildUpdateDisplayRequest(draft)).not.toHaveProperty('posterCrop');
  });

  it('추가 포스터를 모두 지우면 빈 목록을 보내 지운다', () => {
    const original = toEditDraft(DETAIL);
    expect(
      buildUpdateDisplayRequest({ ...original, posters: original.posters.slice(0, 1) }),
    ).toMatchObject({ displayMedia: [] });
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
    expect(buildUpdateDisplayRequest({ ...toEditDraft(DETAIL), latitude: null })).toBeNull();
  });
});

describe('isEditDraftChanged', () => {
  it('수정할 수 있는 항목이 달라졌을 때만 true', () => {
    const original = toEditDraft(DETAIL);
    expect(isEditDraftChanged(original, { ...original })).toBe(false);
    expect(isEditDraftChanged(original, { ...original, title: '새 제목' })).toBe(true);
    expect(isEditDraftChanged(original, { ...original, fieldLabels: ['회화'] })).toBe(true);
    expect(
      isEditDraftChanged(original, { ...original, posters: original.posters.slice(0, 1) }),
    ).toBe(true);
    expect(
      isEditDraftChanged(original, { ...original, posterCrop: { x: 0, y: 0, w: 1, h: 1 } }),
    ).toBe(true);
    expect(isEditDraftChanged(original, { ...original, address: '서울특별시 종로구 1' })).toBe(
      true,
    );
    expect(isEditDraftChanged(original, { ...original, websiteUrl: '' })).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import type { ArtistProfileDto } from '@/api/dto';

import { toEditArtistProfileDefaults, toUpdateArtistProfileBody } from './editArtistProfileBody';

const profile: ArtistProfileDto = {
  artistName: '작가',
  profileImageUrl: 'https://cdn.example.com/photo.jpg',
  introduction: '소개',
  schoolName: '디유대학교',
  externalLink: 'https://portfolio.example.com',
  instagramLink: 'https://www.instagram.com/displayu',
  fields: ['PAINTING', 'UNKNOWN'],
};

describe('toEditArtistProfileDefaults', () => {
  it('Instagram 은 아이디만, Portfolio 는 저장된 주소를 넣고 모르는 분야는 뺀다', () => {
    expect(toEditArtistProfileDefaults(profile)).toEqual({
      artistName: '작가',
      fields: ['PAINTING'],
      introduction: '소개',
      instagram: 'displayu',
      portfolio: 'https://portfolio.example.com',
    });
  });

  it('예전처럼 링크 칸에 인스타그램 주소만 있으면 Instagram 칸으로 옮긴다', () => {
    const values = toEditArtistProfileDefaults({
      ...profile,
      externalLink: 'https://instagram.com/old_id/',
      instagramLink: null,
    });
    expect(values.instagram).toBe('old_id');
    expect(values.portfolio).toBe('');
  });
});

describe('toUpdateArtistProfileBody', () => {
  const values = {
    artistName: ' 작가 ',
    fields: ['PAINTING' as const],
    introduction: ' 소개 ',
    instagram: '@displayu',
    portfolio: 'displayu.kr',
  };

  it('사진을 바꾸지 않아도 현재 사진 주소를 보낸다(빠지면 서버가 사진을 지운다)', () => {
    const body = toUpdateArtistProfileBody(values, {
      profileImageUrl: 'https://cdn.example.com/photo.jpg',
      schoolName: '디유대학교',
    });
    expect(body).toEqual({
      profileImageUrl: 'https://cdn.example.com/photo.jpg',
      artistName: '작가',
      introduction: '소개',
      fields: ['PAINTING'],
      externalLink: 'https://displayu.kr/',
      instagramLink: 'https://instagram.com/displayu',
      univName: '디유대학교',
    });
  });

  it('비운 링크 · 지운 사진은 null 로 보내고 학교가 없으면 univName 을 뺀다', () => {
    const body = toUpdateArtistProfileBody(
      { ...values, instagram: '', portfolio: '  ' },
      { profileImageUrl: null },
    );
    expect(body.profileImageUrl).toBeNull();
    expect(body.externalLink).toBeNull();
    expect(body.instagramLink).toBeNull();
    expect(body).not.toHaveProperty('univName');
  });
});

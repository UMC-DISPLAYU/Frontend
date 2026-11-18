import { describe, expect, it } from 'vitest';

import type { DisplayTeamMemberDto } from '@/api/dto';

import { getArtworkArtistNames } from './artist';

const member = (userId: number, displayNickname: string): DisplayTeamMemberDto => ({
  teamMemberId: userId,
  userId,
  displayNickname,
  role: 'TEAM_MEM',
  accepted: true,
});

describe('getArtworkArtistNames', () => {
  it('artists 가 없거나 비었으면 대표 작가 이름 하나만 쓴다', () => {
    expect(getArtworkArtistNames({ artistName: '고상준', artistUserId: 7 })).toEqual(['고상준']);
    expect(getArtworkArtistNames({ artistName: '고상준', artists: [] })).toEqual(['고상준']);
    expect(getArtworkArtistNames({ artistName: '고상준', artists: null })).toEqual(['고상준']);
  });

  it('artists 가 없어도 대표 작가는 전시용 작가명으로 바꾼다', () => {
    expect(
      getArtworkArtistNames({ artistName: '고상준', artistUserId: 7 }, [member(7, '상준')]),
    ).toEqual(['상준']);
  });

  it('대표 작가 → 공동 작가 순서로 잇고, 계정 없는 공동 작가는 이름 그대로 쓴다', () => {
    expect(
      getArtworkArtistNames({
        artistName: '김수연',
        artistUserId: null,
        artists: [
          { userId: null, name: '김수연' },
          { userId: null, name: '김유빈' },
          { userId: null, name: '김한슬' },
        ],
      }),
    ).toEqual(['김수연', '김유빈', '김한슬']);
  });

  it('artists[0] 의 userId 가 null 이어도 대표 작가로 보고 전시용 작가명을 쓴다', () => {
    expect(
      getArtworkArtistNames(
        {
          artistName: '김수연',
          artistUserId: 7,
          artists: [
            { userId: null, name: '김수연' },
            { userId: null, name: '김유빈' },
          ],
        },
        [member(7, '수연')],
      ),
    ).toEqual(['수연', '김유빈']);
  });

  it('계정 있는 공동 작가도 그 전시의 작가명으로 바꾼다', () => {
    expect(
      getArtworkArtistNames(
        {
          artistName: '고상준',
          artistUserId: 7,
          artists: [
            { userId: 7, name: '고상준' },
            { userId: 8, name: '김서윤' },
            { userId: 9, name: '박도현' },
          ],
        },
        [member(7, '상준'), member(8, '서윤')],
      ),
    ).toEqual(['상준', '서윤', '박도현']);
  });

  it('공동 작가 자리에 대표 작가가 다시 오거나 같은 계정이 겹치면 한 번만 쓴다', () => {
    expect(
      getArtworkArtistNames({
        artistName: '고상준',
        artistUserId: 7,
        artists: [
          { userId: null, name: '고상준' },
          { userId: 7, name: '고상준' },
          { userId: 8, name: '김서윤' },
          { userId: 8, name: '김서윤' },
          { userId: null, name: '고상준' },
        ],
      }),
    ).toEqual(['고상준', '김서윤']);
  });

  it('대표 작가 이름이 비었으면 artists[0] 이름을 쓰고, 빈 이름은 뺀다', () => {
    expect(
      getArtworkArtistNames({
        artistName: '',
        artists: [
          { userId: null, name: '김수연' },
          { userId: null, name: ' ' },
          { userId: null, name: '김유빈' },
        ],
      }),
    ).toEqual(['김수연', '김유빈']);
  });
});

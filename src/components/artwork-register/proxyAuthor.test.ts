import { describe, expect, it } from 'vitest';

import { toTeamCandidates } from './artworkTeam';
import { buildArtworkRegisterPath, parseProxyAuthor } from './proxyAuthor';

const parse = (path: string) => parseProxyAuthor(new URL(path, 'https://x.test').searchParams);

describe('대신 등록 경로', () => {
  it('내 작품 · 팀원 · 직접 입력 작가를 경로로 만들고 다시 읽는다', () => {
    expect(buildArtworkRegisterPath(7)).toBe('/exhibition/7/artworks/new');
    expect(parse(buildArtworkRegisterPath(7, { kind: 'member', userId: 3 }))).toEqual({
      kind: 'member',
      userId: 3,
    });
    expect(parse(buildArtworkRegisterPath(7, { kind: 'name', name: '김 하늘&' }))).toEqual({
      kind: 'name',
      name: '김 하늘&',
    });
  });

  it.each([
    '/x',
    '/x?as=member&userId=0',
    '/x?as=member&userId=abc',
    '/x?as=name&name=%20%20',
    '/x?as=other&name=a',
  ])('잘못된 값(%s)이면 내 작품 등록으로 본다', (path) => {
    expect(parse(path)).toBeNull();
  });

  it('직접 입력한 작가명은 20자까지만 쓴다', () => {
    expect(parse(`/x?as=name&name=${'가'.repeat(25)}`)).toEqual({
      kind: 'name',
      name: '가'.repeat(20),
    });
  });
});

describe('toTeamCandidates', () => {
  const members = [
    { userId: 1, displayNickname: '대표', role: 'LEADER', accepted: true, artistVerified: true },
    { userId: 2, displayNickname: '나', role: 'TEAM_MEM', accepted: true, artistVerified: true },
    {
      userId: 3,
      displayNickname: '미인증',
      role: 'TEAM_MEM',
      accepted: true,
      artistVerified: false,
    },
    { userId: 4, displayNickname: '대기', role: 'TEAM_MEM', accepted: false, artistVerified: true },
  ];

  it('초대를 수락한 팀원만 남기고 제외할 사람을 뺀다', () => {
    expect(
      toTeamCandidates(members, { ownerUserId: 1, excludeUserIds: [2] }).map((m) => m.userId),
    ).toEqual([1, 3]);
  });

  it('공동 작가는 작가 인증을 하지 않은 팀원을 고를 수 없게 한다', () => {
    expect(
      toTeamCandidates(members, { ownerUserId: 1, requireArtistVerified: true }).map(
        ({ userId, caption, disabled }) => [userId, caption, disabled],
      ),
    ).toEqual([
      [1, '대표자', false],
      [2, '팀원', false],
      [3, '작가 인증 필요', true],
    ]);
  });
});

import { describe, expect,it } from 'vitest';

import type { Attrs } from './permissions';
import { can } from './permissions';

/* ------------------------------------------------------------------
 * 1. 속성(Attribute) 정의  — ABAC의 subject / resource / environment
 *    (실제 정의는 ./permissions의 Attrs — 여기서는 재사용만 한다)
 * ----------------------------------------------------------------*/

const BASE: Attrs = {
  authenticated: false,
  artistVerified: false,
  isDisplayOwner: false,
  isDisplayMember: false,
  isArtworkCreator: false,
  isArtworkCollaborator: false,
  isQnaManager: false,
  isPersonalArtworkOwner: false,
  isAuthor: false,
  isReplyAuthor: false,
  isMyArchive: false,
  isPrivate: false,
  isArtistOnlyBoard: false,
};

/* ------------------------------------------------------------------
 * 2. 역할(Role) = 속성 묶음
 *    "역할"은 시스템에 저장된 값이 아니라, 테스트 편의를 위한 속성 프리셋이다.
 * ----------------------------------------------------------------*/

const ROLES = {
  /** 비회원 */
  guest: { ...BASE },

  /** 일반 회원 (작가 아님, 아무 관계 없음) */
  member: { ...BASE, authenticated: true },

  /** 해당 글/질문을 쓴 회원 */
  author: { ...BASE, authenticated: true, isAuthor: true },

  /** 해당 답글을 쓴 회원 */
  replyAuthor: { ...BASE, authenticated: true, isReplyAuthor: true },

  /** 작가 인증만 한 사람 (해당 전시와 무관) */
  artist: { ...BASE, authenticated: true, artistVerified: true },

  /** 작가 인증 + 전시 소속인 */
  displayMember: {
    ...BASE,
    authenticated: true,
    artistVerified: true,
    isDisplayMember: true,
  },

  /** 작가 인증 + 전시 소유자 (소유자는 소속인을 포함한다고 가정) */
  displayOwner: {
    ...BASE,
    authenticated: true,
    artistVerified: true,
    isDisplayMember: true,
    isDisplayOwner: true,
  },

  /** 전시 소속인 + 해당 작품 QnA 담당자 */
  qnaManager: {
    ...BASE,
    authenticated: true,
    artistVerified: true,
    isDisplayMember: true,
    isQnaManager: true,
  },

  /** 전시 소속인 + 작품 생성자 */
  artworkCreator: {
    ...BASE,
    authenticated: true,
    artistVerified: true,
    isDisplayMember: true,
    isArtworkCreator: true,
  },

  /** 전시 소속인 + 작품 공동작업자 */
  artworkCollaborator: {
    ...BASE,
    authenticated: true,
    artistVerified: true,
    isDisplayMember: true,
    isArtworkCollaborator: true,
  },

  /** 작가 인증 + 개인 작품을 만든 사람 */
  personalArtworkOwner: {
    ...BASE,
    authenticated: true,
    artistVerified: true,
    isPersonalArtworkOwner: true,
  },

  /** 회원 + 내가 저장한 아카이브 */
  archiveOwner: { ...BASE, authenticated: true, isMyArchive: true },
} satisfies Record<string, Attrs>;

type RoleName = keyof typeof ROLES;

const ALL_ROLES = Object.keys(ROLES) as RoleName[];

/** 로그인한 모든 역할 */
const MEMBERS = ALL_ROLES.filter((r) => ROLES[r].authenticated);

/** 작가 인증을 마친 모든 역할 */
const ARTISTS = ALL_ROLES.filter((r) => ROLES[r].artistVerified);

/** 전시에 소속된 작가 (소유자 포함) */
const DISPLAY_MEMBERS = ALL_ROLES.filter((r) => ROLES[r].isDisplayMember);

/* ------------------------------------------------------------------
 * 3. 어댑터 — 구현 시그니처가 달라지면 이 함수 하나만 고치면 된다.
 * ----------------------------------------------------------------*/

function check(role: RoleName, permission: string, override: Partial<Attrs> = {}) {
  const attrs = { ...ROLES[role], ...override };
  return can(attrs, permission);
}

/* ------------------------------------------------------------------
 * 4. 권한 매트릭스 — 여기에 "허용되는 역할"만 선언한다.
 *    선언되지 않은 역할은 전부 자동으로 거부 케이스가 된다.
 * ----------------------------------------------------------------*/

type Rule = {
  /** 'display:create' 형태 */
  permission: string;
  /** 이 규칙이 적용되는 리소스 상태 (예: 비공개 질문) */
  when?: Partial<Attrs>;
  /** 사람이 읽을 조건 설명 (테스트 이름에 노출) */
  desc: string;
  /** 통과해야 하는 역할 */
  allow: RoleName[];
};

const MATRIX: Record<string, Rule[]> = {
  display: [
    { permission: 'display:create', desc: '작가 인증', allow: ARTISTS },
    { permission: 'display:edit', desc: '작가 인증 && 전시 소유자', allow: ['displayOwner'] },
    { permission: 'display:delete', desc: '작가 인증 && 전시 소유자', allow: ['displayOwner'] },
  ],

  displayContent: (
    [
      'createCategory',
      'editCategory',
      'deleteCategory',
      'createContent',
      'editContent',
      'deleteContent',
      'reorder',
    ] as const
  ).map((a) => ({
    permission: `displayContent:${a}`,
    desc: '작가 인증 && 전시 소유자',
    allow: ['displayOwner' as RoleName],
  })),

  displayInvitation: [
    {
      permission: 'displayInvitation:create',
      desc: '작가 인증 && 전시 소유자',
      allow: ['displayOwner'],
    },
  ],

  artwork: [
    {
      permission: 'artwork:create',
      desc: '작가 인증 && 전시 소속인',
      allow: DISPLAY_MEMBERS,
    },
    {
      permission: 'artwork:edit',
      desc: '전시 소속인 && (작품 생성자 || 공동작업자)',
      allow: ['artworkCreator', 'artworkCollaborator'],
    },
    {
      permission: 'artwork:delete',
      desc: '전시 소속인 && (작품 생성자 || 공동작업자)',
      allow: ['artworkCreator', 'artworkCollaborator'],
    },
    {
      permission: 'artwork:reorder',
      desc: '작가 인증 && 전시 소유자',
      allow: ['displayOwner'],
    },
  ],

  question: [
    {
      permission: 'question:view',
      when: { isPrivate: false },
      desc: '공개 질문은 누구나',
      allow: ALL_ROLES,
    },
    {
      permission: 'question:view',
      when: { isPrivate: true },
      desc: '비공개: 질문 쓴 사람 || (작가 인증 && 전시 소속인)',
      allow: ['author', ...DISPLAY_MEMBERS],
    },
    {
      permission: 'question:create',
      desc: '회원 && 해당 작품의 작가(공동 작업자 포함)가 아님',
      allow: MEMBERS.filter((r) => r !== 'artworkCreator' && r !== 'artworkCollaborator'),
    },
    {
      permission: 'question:delete',
      desc: '질문 쓴 사람 || (작가 인증 && 전시 소유자)',
      allow: ['author', 'displayOwner'],
    },
    { permission: 'question:like', desc: '회원', allow: MEMBERS },
    { permission: 'question:unlike', desc: '회원', allow: MEMBERS },
    {
      permission: 'question:reply.view',
      when: { isPrivate: false },
      desc: '공개 질문의 답변은 누구나',
      allow: ALL_ROLES,
    },
    {
      permission: 'question:reply.view',
      when: { isPrivate: true },
      desc: '비공개: 질문 쓴 사람 || (작가 인증 && 전시 소속인)',
      allow: ['author', ...DISPLAY_MEMBERS],
    },
    {
      permission: 'question:reply.create',
      desc: '작가 인증 && (전시 소유자 || (전시 소속인 && QnA 담당자))',
      allow: ['displayOwner', 'qnaManager'],
    },
    { permission: 'question:reply.like', desc: '회원', allow: MEMBERS },
    { permission: 'question:reply.unlike', desc: '회원', allow: MEMBERS },
    {
      permission: 'question:reply.delete',
      desc: '응답 쓴 사람 || (작가 인증 && 전시 소유자)',
      allow: ['replyAuthor', 'displayOwner'],
    },
  ],

  feeling: [
    { permission: 'feeling:create', desc: '회원', allow: MEMBERS },
    {
      permission: 'feeling:delete',
      desc: '쓴 사람 || (작가 인증 && 전시 소유자)',
      allow: ['author', 'displayOwner'],
    },
    { permission: 'feeling:like', desc: '회원', allow: MEMBERS },
    { permission: 'feeling:unlike', desc: '회원', allow: MEMBERS },
    { permission: 'feeling:reply.create', desc: '회원', allow: MEMBERS },
    { permission: 'feeling:reply.like', desc: '회원', allow: MEMBERS },
    { permission: 'feeling:reply.unlike', desc: '회원', allow: MEMBERS },
    {
      permission: 'feeling:reply.delete',
      desc: '응답 쓴 사람 || (작가 인증 && 전시 소유자)',
      allow: ['replyAuthor', 'displayOwner'],
    },
  ],

  displayReview: [
    { permission: 'displayReview:create', desc: '회원', allow: MEMBERS },
    {
      permission: 'displayReview:delete',
      desc: '쓴 사람 || (작가 인증 && 전시 소유자)',
      allow: ['author', 'displayOwner'],
    },
    { permission: 'displayReview:like', desc: '회원', allow: MEMBERS },
    { permission: 'displayReview:unlike', desc: '회원', allow: MEMBERS },
    { permission: 'displayReview:reply.create', desc: '회원', allow: MEMBERS },
    { permission: 'displayReview:reply.like', desc: '회원', allow: MEMBERS },
    { permission: 'displayReview:reply.unlike', desc: '회원', allow: MEMBERS },
    {
      permission: 'displayReview:reply.delete',
      desc: '응답 쓴 사람 || (작가 인증 && 전시 소유자)',
      allow: ['replyAuthor', 'displayOwner'],
    },
  ],

  personalArtwork: [
    { permission: 'personalArtwork:create', desc: '작가 인증', allow: ARTISTS },
    {
      permission: 'personalArtwork:edit',
      desc: '작가 인증 && 작품 만든 사람',
      allow: ['personalArtworkOwner'],
    },
    {
      permission: 'personalArtwork:delete',
      desc: '작가 인증 && 작품 만든 사람',
      allow: ['personalArtworkOwner'],
    },
    { permission: 'personalArtwork:like', desc: '회원', allow: MEMBERS },
    { permission: 'personalArtwork:unlike', desc: '회원', allow: MEMBERS },
  ],

  personalQuestion: [
    {
      permission: 'personalQuestion:view',
      when: { isPrivate: false },
      desc: '공개 질문은 누구나',
      allow: ALL_ROLES,
    },
    {
      permission: 'personalQuestion:view',
      when: { isPrivate: true },
      desc: '비공개: 질문 쓴 사람 || (작가 인증 && 작품 만든 사람)',
      allow: ['author', 'personalArtworkOwner'],
    },
    { permission: 'personalQuestion:create', desc: '회원', allow: MEMBERS },
    {
      permission: 'personalQuestion:delete',
      desc: '질문 쓴 사람 || (작가 인증 && 작품 만든 사람)',
      allow: ['author', 'personalArtworkOwner'],
    },
    {
      permission: 'personalQuestion:reply.view',
      when: { isPrivate: false },
      desc: '공개 질문의 답변은 누구나',
      allow: ALL_ROLES,
    },
    {
      permission: 'personalQuestion:reply.view',
      when: { isPrivate: true },
      desc: '비공개: 질문 쓴 사람 || (작가 인증 && 작품 만든 사람)',
      allow: ['author', 'personalArtworkOwner'],
    },
    {
      permission: 'personalQuestion:reply.create',
      desc: '작가 인증 && 작품 만든 사람',
      allow: ['personalArtworkOwner'],
    },
    { permission: 'personalQuestion:reply.like', desc: '회원', allow: MEMBERS },
    { permission: 'personalQuestion:reply.unlike', desc: '회원', allow: MEMBERS },
    {
      permission: 'personalQuestion:reply.delete',
      desc: '응답 쓴 사람',
      allow: ['replyAuthor'],
    },
  ],

  personalFeeling: [
    { permission: 'personalFeeling:create', desc: '회원', allow: MEMBERS },
    {
      permission: 'personalFeeling:delete',
      desc: '쓴 사람 || (작가 인증 && 작품 만든 사람)',
      allow: ['author', 'personalArtworkOwner'],
    },
    { permission: 'personalFeeling:like', desc: '회원', allow: MEMBERS },
    { permission: 'personalFeeling:unlike', desc: '회원', allow: MEMBERS },
    { permission: 'personalFeeling:reply.create', desc: '회원', allow: MEMBERS },
    { permission: 'personalFeeling:reply.like', desc: '회원', allow: MEMBERS },
    { permission: 'personalFeeling:reply.unlike', desc: '회원', allow: MEMBERS },
    {
      permission: 'personalFeeling:reply.delete',
      desc: '응답 쓴 사람 || (작가 인증 && 작품 만든 사람)',
      allow: ['replyAuthor', 'personalArtworkOwner'],
    },
  ],

  loungePost: [
    {
      permission: 'loungePost:view',
      when: { isArtistOnlyBoard: false },
      desc: '전시 후기 · 전시 장소 대여 게시판은 누구나',
      allow: ALL_ROLES,
    },
    {
      permission: 'loungePost:view',
      when: { isArtistOnlyBoard: true },
      desc: '전시 준비·작업 팁 · 모집·협업 게시판은 작가 인증',
      allow: ARTISTS,
    },
    { permission: 'loungePost:create', desc: '회원', allow: MEMBERS },
    { permission: 'loungePost:edit', desc: '작성한 사람', allow: ['author'] },
    { permission: 'loungePost:delete', desc: '작성한 사람', allow: ['author'] },
    { permission: 'loungePost:like', desc: '회원', allow: MEMBERS },
    { permission: 'loungePost:unlike', desc: '회원', allow: MEMBERS },
    { permission: 'loungePost:scrap', desc: '회원', allow: MEMBERS },
  ],

  loungeComment: [
    { permission: 'loungeComment:create', desc: '회원', allow: MEMBERS },
    { permission: 'loungeComment:delete', desc: '작성한 사람', allow: ['author'] },
    { permission: 'loungeComment:like', desc: '회원', allow: MEMBERS },
    { permission: 'loungeComment:unlike', desc: '회원', allow: MEMBERS },
  ],

  archive: [
    { permission: 'archive:create', desc: '회원', allow: MEMBERS },
    { permission: 'archive:delete', desc: '회원', allow: MEMBERS },
  ],

  memo: [
    {
      permission: 'memo:view',
      desc: '회원 && 내가 저장한 아카이브',
      allow: ['archiveOwner'],
    },
    {
      permission: 'memo:upsert',
      desc: '회원 && 내가 저장한 아카이브',
      allow: ['archiveOwner'],
    },
    {
      permission: 'memo:delete',
      desc: '회원 && 내가 저장한 아카이브',
      allow: ['archiveOwner'],
    },
  ],

  artist: [{ permission: 'artist:view', desc: '작가 인증', allow: ARTISTS }],

  displayArtistName: [
    {
      permission: 'displayArtistName:edit',
      desc: '작가 인증 && 전시 참여자',
      allow: DISPLAY_MEMBERS,
    },
  ],
};

const ALL_RULES = Object.values(MATRIX).flat();

/* ------------------------------------------------------------------
 * 5. 역할별 테스트 — describe(역할) > describe(리소스) > it(권한)
 * ----------------------------------------------------------------*/

describe.each(ALL_ROLES)('역할: %s', (role) => {
  for (const [resource, rules] of Object.entries(MATRIX)) {
    describe(resource, () => {
      it.each(
        rules.map((rule) => {
          const expected = rule.allow.includes(role);
          const label = [
            rule.permission,
            rule.when ? `(${describeWhen(rule.when)})` : '',
            '→',
            expected ? '허용' : '거부',
          ]
            .filter(Boolean)
            .join(' ');
          return [label, rule, expected] as const;
        })
      )('%s', (_label, rule, expected) => {
        expect(check(role, rule.permission, rule.when)).toBe(expected);
      });
    });
  }
});

function describeWhen(when: Partial<Attrs>) {
  return Object.entries(when)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
}

/* ------------------------------------------------------------------
 * 6. 매트릭스 자체의 무결성 검사
 *    — 규칙을 빠뜨리거나 오타를 냈을 때 여기서 걸린다.
 * ----------------------------------------------------------------*/

describe('권한 테이블 무결성', () => {
  it('허용 목록에 오타나 미정의 역할이 없다', () => {
    const unknown = ALL_RULES.flatMap((r) =>
      r.allow.filter((role) => !ALL_ROLES.includes(role))
    );
    expect(unknown).toEqual([]);
  });

  it('같은 조건의 규칙이 중복 선언되지 않았다', () => {
    const keys = ALL_RULES.map(
      (r) => `${r.permission}|${JSON.stringify(r.when ?? {})}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('정의되지 않은 권한 문자열은 항상 거부된다', () => {
    for (const role of ALL_ROLES) {
      expect(check(role, 'display:__unknown__')).toBe(false);
      expect(check(role, '__unknown__:view')).toBe(false);
    }
  });

  it('전체 역할 × 권한 결과 스냅샷', () => {
    const snapshot = ALL_RULES.map((rule) => ({
      permission: rule.permission,
      when: rule.when ?? null,
      condition: rule.desc,
      allowed: ALL_ROLES.filter((role) =>
        check(role, rule.permission, rule.when)
      ),
    }));
    expect(snapshot).toMatchSnapshot();
  });
});

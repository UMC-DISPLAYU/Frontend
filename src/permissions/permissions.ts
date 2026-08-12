import { LOUNGE_CATEGORY_API_VALUES } from '@/constants/loungeCategories';
import { policies } from '@/policies/policies';
import type {
  ArtworkPolicyResource,
  DisplayPolicyResource,
  LoungePostPolicyResource,
  MyResource,
  PrivatableResource,
  UserOwnedResource,
} from '@/policies/util';
import type { User } from '@/types/policy';

/**
 * ABAC 테스트용으로 평탄화한 속성 집합입니다.
 * 실제 도메인 객체(User/DisplayPolicyResource/ArtworkPolicyResource...)를 테스트마다
 * 직접 조립하는 대신, "이 역할에서 무엇이 참인가"만 선언할 수 있도록 하는 계층입니다.
 * 아래 toXxx() 함수들이 이 값들을 실제 policies.ts가 기대하는 리소스 형태로 변환합니다.
 */
export type Attrs = {
  authenticated: boolean;
  artistVerified: boolean;

  isDisplayOwner: boolean;
  isDisplayMember: boolean;

  isArtworkCreator: boolean;
  isArtworkCollaborator: boolean;
  isQnaManager: boolean;

  isPersonalArtworkOwner: boolean;

  isAuthor: boolean;
  isReplyAuthor: boolean;

  isMyArchive: boolean;

  isPrivate: boolean;

  // 라운지 게시판 카테고리가 작가 인증이 있어야 열람 가능한 게시판인가
  // (전시 준비·작업 팁 / 모집·협업 — 전시 후기·전시 장소 대여는 false)
  isArtistOnlyBoard: boolean;
};

/* ------------------------------------------------------------------
 * Attrs → 실제 도메인 리소스 변환
 * 실제 유저 id 값 자체는 의미가 없고 "나(SELF)"와 "남(OTHER)"만 구분되면 되므로
 * 고정된 두 개의 id만 사용합니다.
 * ----------------------------------------------------------------*/

const SELF_ID = 1;
const OTHER_ID = 2;

function toUser(a: Attrs): User {
  return { id: a.authenticated ? SELF_ID : null, isArtistVerified: a.artistVerified };
}

function toDisplay(a: Attrs): DisplayPolicyResource {
  if (a.isDisplayOwner) {
    return { ownerUserId: SELF_ID, teamMembers: [{ userId: SELF_ID, accepted: true }] };
  }
  if (a.isDisplayMember) {
    return { ownerUserId: OTHER_ID, teamMembers: [{ userId: SELF_ID, accepted: true }] };
  }
  return { ownerUserId: OTHER_ID, teamMembers: [] };
}

function toArtwork(a: Attrs): ArtworkPolicyResource {
  return {
    artistUserId: a.isArtworkCreator ? SELF_ID : OTHER_ID,
    coAuthorUserIds: a.isArtworkCollaborator ? [SELF_ID] : [],
    qaHandlers: a.isQnaManager ? [{ userId: SELF_ID }] : [],
  };
}

// 질문/감상평/리뷰 "원글" — 작성자 여부(isAuthor) + 공개 여부(isPrivate)
function toPost(a: Attrs): UserOwnedResource & PrivatableResource {
  return { userId: a.isAuthor ? SELF_ID : OTHER_ID, isPublic: !a.isPrivate };
}

// 답글 — 작성자 여부(isReplyAuthor)
function toReply(a: Attrs): UserOwnedResource {
  return { userId: a.isReplyAuthor ? SELF_ID : OTHER_ID };
}

function toPersonalArtwork(a: Attrs): UserOwnedResource {
  return { userId: a.isPersonalArtworkOwner ? SELF_ID : OTHER_ID };
}

// 라운지 글/댓글 — isMine 계열은 isAuthor로 통일해 표현
function toMyResource(a: Attrs): MyResource {
  return { isMine: a.isAuthor };
}

// 라운지 글 — 작성자 여부(isAuthor) + 게시판 카테고리(isArtistOnlyBoard)
function toLoungePost(a: Attrs): MyResource & LoungePostPolicyResource {
  return {
    isMine: a.isAuthor,
    category: a.isArtistOnlyBoard
      ? LOUNGE_CATEGORY_API_VALUES.tips
      : LOUNGE_CATEGORY_API_VALUES.review,
  };
}

function toArchiveItem(a: Attrs): UserOwnedResource {
  return { userId: a.isMyArchive ? SELF_ID : OTHER_ID };
}

/* ------------------------------------------------------------------
 * permission 문자열 → 실제 policies 호출
 * 각 항목이 policies.ts의 실제 함수를 직접 참조하므로, PolicyActionMap이 바뀌어
 * 시그니처나 존재 여부가 달라지면 이 파일이 컴파일 에러로 즉시 알려준다.
 * 여기 없는 permission 문자열은 전부 거부(false)한다.
 * ----------------------------------------------------------------*/

const PERMISSION_CHECKS: Record<string, (a: Attrs) => boolean> = {
  'artist:view': (a) => policies.artist.view(toUser(a)),

  'display:create': (a) => policies.display.create(toUser(a)),
  'display:edit': (a) => policies.display.edit(toUser(a), toDisplay(a)),
  'display:delete': (a) => policies.display.delete(toUser(a), toDisplay(a)),

  'displayArtistName:edit': (a) => policies.displayArtistName.edit(toUser(a), toDisplay(a)),

  'displayContent:createCategory': (a) =>
    policies.displayContent.createCategory(toUser(a), toDisplay(a)),
  'displayContent:editCategory': (a) =>
    policies.displayContent.editCategory(toUser(a), toDisplay(a)),
  'displayContent:deleteCategory': (a) =>
    policies.displayContent.deleteCategory(toUser(a), toDisplay(a)),
  'displayContent:createContent': (a) =>
    policies.displayContent.createContent(toUser(a), toDisplay(a)),
  'displayContent:editContent': (a) =>
    policies.displayContent.editContent(toUser(a), toDisplay(a)),
  'displayContent:deleteContent': (a) =>
    policies.displayContent.deleteContent(toUser(a), toDisplay(a)),
  'displayContent:reorder': (a) => policies.displayContent.reorder(toUser(a), toDisplay(a)),

  'displayInvitation:create': (a) => policies.displayInvitation.create(toUser(a), toDisplay(a)),

  'artwork:create': (a) => policies.artwork.create(toUser(a), toDisplay(a)),
  'artwork:edit': (a) => policies.artwork.edit(toUser(a), toArtwork(a), toDisplay(a)),
  'artwork:delete': (a) => policies.artwork.delete(toUser(a), toArtwork(a), toDisplay(a)),
  'artwork:reorder': (a) => policies.artwork.reorder(toUser(a), toDisplay(a)),

  'question:view': (a) => policies.question.view(toUser(a), toPost(a), toDisplay(a)),
  'question:create': (a) => policies.question.create(toUser(a)),
  'question:delete': (a) => policies.question.delete(toUser(a), toPost(a), toDisplay(a)),
  'question:like': (a) => policies.question.like(toUser(a)),
  'question:unlike': (a) => policies.question.unlike(toUser(a)),
  'question:reply.view': (a) => policies.question.reply.view(toUser(a), toPost(a), toDisplay(a)),
  'question:reply.create': (a) =>
    policies.question.reply.create(toUser(a), toArtwork(a), toDisplay(a)),
  'question:reply.like': (a) => policies.question.reply.like(toUser(a)),
  'question:reply.unlike': (a) => policies.question.reply.unlike(toUser(a)),
  'question:reply.delete': (a) =>
    policies.question.reply.delete(toUser(a), toReply(a), toDisplay(a)),

  'feeling:create': (a) => policies.feeling.create(toUser(a)),
  'feeling:delete': (a) => policies.feeling.delete(toUser(a), toPost(a), toDisplay(a)),
  'feeling:like': (a) => policies.feeling.like(toUser(a)),
  'feeling:unlike': (a) => policies.feeling.unlike(toUser(a)),
  'feeling:reply.create': (a) => policies.feeling.reply.create(toUser(a)),
  'feeling:reply.like': (a) => policies.feeling.reply.like(toUser(a)),
  'feeling:reply.unlike': (a) => policies.feeling.reply.unlike(toUser(a)),
  'feeling:reply.delete': (a) =>
    policies.feeling.reply.delete(toUser(a), toReply(a), toDisplay(a)),

  'displayReview:create': (a) => policies.displayReview.create(toUser(a)),
  'displayReview:like': (a) => policies.displayReview.like(toUser(a)),
  'displayReview:unlike': (a) => policies.displayReview.unlike(toUser(a)),
  'displayReview:delete': (a) =>
    policies.displayReview.delete(toUser(a), toPost(a), toDisplay(a)),
  'displayReview:reply.create': (a) => policies.displayReview.reply.create(toUser(a)),
  'displayReview:reply.like': (a) => policies.displayReview.reply.like(toUser(a)),
  'displayReview:reply.unlike': (a) => policies.displayReview.reply.unlike(toUser(a)),
  'displayReview:reply.delete': (a) =>
    policies.displayReview.reply.delete(toUser(a), toReply(a), toDisplay(a)),

  'personalArtwork:create': (a) => policies.personalArtwork.create(toUser(a)),
  'personalArtwork:like': (a) => policies.personalArtwork.like(toUser(a)),
  'personalArtwork:unlike': (a) => policies.personalArtwork.unlike(toUser(a)),
  'personalArtwork:edit': (a) => policies.personalArtwork.edit(toUser(a), toPersonalArtwork(a)),
  'personalArtwork:delete': (a) =>
    policies.personalArtwork.delete(toUser(a), toPersonalArtwork(a)),

  'personalQuestion:view': (a) =>
    policies.personalQuestion.view(toUser(a), toPost(a), toPersonalArtwork(a)),
  'personalQuestion:create': (a) => policies.personalQuestion.create(toUser(a)),
  'personalQuestion:delete': (a) =>
    policies.personalQuestion.delete(toUser(a), toPost(a), toPersonalArtwork(a)),
  'personalQuestion:like': (a) => policies.personalQuestion.like(toUser(a)),
  'personalQuestion:unlike': (a) => policies.personalQuestion.unlike(toUser(a)),
  'personalQuestion:reply.view': (a) =>
    policies.personalQuestion.reply.view(toUser(a), toPost(a), toPersonalArtwork(a)),
  'personalQuestion:reply.create': (a) =>
    policies.personalQuestion.reply.create(toUser(a), toPersonalArtwork(a)),
  'personalQuestion:reply.like': (a) => policies.personalQuestion.reply.like(toUser(a)),
  'personalQuestion:reply.unlike': (a) => policies.personalQuestion.reply.unlike(toUser(a)),
  'personalQuestion:reply.delete': (a) => policies.personalQuestion.reply.delete(toUser(a), toReply(a)),

  'personalFeeling:create': (a) => policies.personalFeeling.create(toUser(a)),
  'personalFeeling:like': (a) => policies.personalFeeling.like(toUser(a)),
  'personalFeeling:unlike': (a) => policies.personalFeeling.unlike(toUser(a)),
  'personalFeeling:delete': (a) =>
    policies.personalFeeling.delete(toUser(a), toPost(a), toPersonalArtwork(a)),
  'personalFeeling:reply.create': (a) => policies.personalFeeling.reply.create(toUser(a)),
  'personalFeeling:reply.like': (a) => policies.personalFeeling.reply.like(toUser(a)),
  'personalFeeling:reply.unlike': (a) => policies.personalFeeling.reply.unlike(toUser(a)),
  'personalFeeling:reply.delete': (a) =>
    policies.personalFeeling.reply.delete(toUser(a), toReply(a), toPersonalArtwork(a)),

  'loungePost:view': (a) => policies.loungePost.view(toUser(a), toLoungePost(a)),
  'loungePost:create': (a) => policies.loungePost.create(toUser(a)),
  'loungePost:edit': (a) => policies.loungePost.edit(toUser(a), toMyResource(a)),
  'loungePost:delete': (a) => policies.loungePost.delete(toUser(a), toMyResource(a)),
  'loungePost:like': (a) => policies.loungePost.like(toUser(a)),
  'loungePost:unlike': (a) => policies.loungePost.unlike(toUser(a)),
  'loungePost:scrap': (a) => policies.loungePost.scrap(toUser(a)),

  'loungeComment:create': (a) => policies.loungeComment.create(toUser(a)),
  'loungeComment:delete': (a) => policies.loungeComment.delete(toUser(a), toMyResource(a)),
  'loungeComment:like': (a) => policies.loungeComment.like(toUser(a)),
  'loungeComment:unlike': (a) => policies.loungeComment.unlike(toUser(a)),

  'archive:create': (a) => policies.archive.create(toUser(a)),
  'archive:delete': (a) => policies.archive.delete(toUser(a)),

  'memo:view': (a) => policies.memo.view(toUser(a), toArchiveItem(a)),
  'memo:upsert': (a) => policies.memo.upsert(toUser(a), toArchiveItem(a)),
  'memo:delete': (a) => policies.memo.delete(toUser(a), toArchiveItem(a)),
};

export function can(attrs: Attrs, permission: string): boolean {
  const check = PERMISSION_CHECKS[permission];
  return check ? check(attrs) : false;
}

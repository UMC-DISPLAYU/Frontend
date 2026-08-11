import { LOUNGE_CATEGORY_API_VALUES } from '@/constants/loungeCategories';
import type { User } from '@/types/policy';

export interface DisplayPolicyResource {
  ownerUserId: number;
  teamMembers: {
    userId: number;
    accepted: boolean;
  }[];
}

export interface ArtworkPolicyResource {
  artistUserId: number;
  qaHandlers?: {
    userId: number;
  }[];
  /* 공동 작업자. 계정이 연결되지 않은 공동 작업자는 userId가 null입니다. */
  coAuthors?: {
    userId: number | null;
    name: string;
  }[];
}

export interface PrivatableResource {
  isPublic?: boolean;
}

export interface UserOwnedResource {
  userId?: number;
  user?: {
    userId: number;
  } | null;
}

export interface MyResource {
  isMine?: boolean;
  isMyPost?: boolean;
  isMyComment?: boolean;
}

export interface LoungePostPolicyResource {
  category: string;
}

export function isLoggedIn(user: User): boolean {
  return user.id !== null;
}

export function isOwner(user: User, resource: UserOwnedResource): boolean {
  return isLoggedIn(user) && user.id === (resource.userId ?? resource.user?.userId);
}

export function isMine(resource: MyResource): boolean {
  return Boolean(resource.isMine ?? resource.isMyPost ?? resource.isMyComment);
}

export function isArtistVerified(user: User): boolean {
  return isLoggedIn(user) && user.isArtistVerified;
}

/* isPublic이 누락된 응답을 공개로 보면 비공개 질문이 노출되므로 명시적 true만 공개로 봅니다. */
export function isPrivate(resource: PrivatableResource): boolean {
  return resource.isPublic !== true;
}

export function isDisplayOwner(user: User, display: DisplayPolicyResource): boolean {
  return isLoggedIn(user) && user.id === display.ownerUserId;
}

// 전시 소속인. 초대를 수락한 팀원이거나 전시 소유자 본인
export function isDisplayMember(user: User, display: DisplayPolicyResource): boolean {
  if (!isLoggedIn(user)) return false;

  /* 서버 응답에서 teamMembers가 누락될 수 있어 옵셔널 체이닝으로 방어합니다. */
  return (
    isDisplayOwner(user, display) ||
    (display.teamMembers?.some((member) => member.userId === user.id && member.accepted) ?? false)
  );
}

// 전시 관리(수정/삭제/초대/콘텐츠 편집)는 작가 인증을 받은 소유자만 가능
export function canManageDisplay(user: User, display: DisplayPolicyResource): boolean {
  return isArtistVerified(user) && isDisplayOwner(user, display);
}

// 작품을 만든 사람. 등록자 본인이거나 공동 작업자
export function isArtworkAuthor(user: User, artwork: ArtworkPolicyResource): boolean {
  const userId = user.id;
  if (userId === null) return false;

  return (
    userId === artwork.artistUserId ||
    Boolean(artwork.coAuthors?.some((coAuthor) => coAuthor.userId === userId))
  );
}

export function isQaHandler(user: User, artwork: ArtworkPolicyResource): boolean {
  if (!isLoggedIn(user)) return false;

  return Boolean(artwork.qaHandlers?.some((handler) => handler.userId === user.id));
}

// 작품 수정/삭제는 작가 인증을 받은 전시 소속인 중 작품을 만든 사람만 가능
export function canManageArtwork(
  user: User,
  artwork: ArtworkPolicyResource,
  display: DisplayPolicyResource,
): boolean {
  return isArtistVerified(user) && isDisplayMember(user, display) && isArtworkAuthor(user, artwork);
}

// 전시 게시물(질문/감상평/리뷰) 삭제는 작성자 본인이거나 작가 인증을 받은 전시 소유자
export function canModerateDisplayPost(
  user: User,
  resource: UserOwnedResource,
  display: DisplayPolicyResource,
): boolean {
  return isOwner(user, resource) || canManageDisplay(user, display);
}

// 개인 작품 게시물 삭제는 작성자 본인이거나 작가 인증을 받은 작품 주인
export function canModeratePersonalPost(
  user: User,
  resource: UserOwnedResource,
  personalArtwork: UserOwnedResource,
): boolean {
  return isOwner(user, resource) || (isArtistVerified(user) && isOwner(user, personalArtwork));
}

// 작가 인증이 있어야 열람 가능한 라운지 게시판 (전시 준비·작업 팁 / 모집·협업)
const ARTIST_ONLY_LOUNGE_CATEGORIES: readonly string[] = [
  LOUNGE_CATEGORY_API_VALUES.tips,
  LOUNGE_CATEGORY_API_VALUES.collab,
];

// 전시 후기·전시 장소 대여 게시판은 비회원도 열람 가능, 나머지는 작가 인증 필요
export function canViewLoungePost(user: User, post: LoungePostPolicyResource): boolean {
  if (!ARTIST_ONLY_LOUNGE_CATEGORIES.includes(post.category)) return true;

  return isArtistVerified(user);
}

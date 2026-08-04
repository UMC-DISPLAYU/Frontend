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
}

export interface UserOwnedResource {
  userId?: number;
  user?: {
    userId: number;
  };
}

export interface MyResource {
  isMine?: boolean;
  isMyPost?: boolean;
  isMyComment?: boolean;
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

export function isDisplayOwner(user: User, display: DisplayPolicyResource): boolean {
  return isLoggedIn(user) && user.id === display.ownerUserId;
}

export function canManageArtwork(
  user: User,
  artwork: ArtworkPolicyResource,
  display: DisplayPolicyResource,
): boolean {
  if (!isLoggedIn(user)) return false;

  return (
    user.id === display.ownerUserId ||
    user.id === artwork.artistUserId ||
    Boolean(artwork.qaHandlers?.some((handler) => handler.userId === user.id))
  );
}

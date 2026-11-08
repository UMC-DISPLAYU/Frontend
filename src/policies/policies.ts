import type {
  ArtworkPolicyResource,
  DisplayPolicyResource,
  LoungePostPolicyResource,
  MyResource,
  UserOwnedResource,
} from '@/policies/util';
import {
  canManageArtwork,
  canManageDisplay,
  canModerateDisplayPost,
  canModeratePersonalPost,
  canViewLoungePost,
  isArtistVerified,
  isDisplayMember,
  isLoggedIn,
  isMine,
  isOwner,
} from '@/policies/util';
import type { PolicyDefinitionMap, User } from '@/types/policy';

export const policies = {
  artist: {
    view: (user: User) => isArtistVerified(user),
  },

  display: {
    // 전시 작업 화면 열람은 작가 인증 여부와 무관하게 소유자/전시 소속인이면 가능
    view: (user: User, display: DisplayPolicyResource) => isDisplayMember(user, display),
    create: (user: User) => isArtistVerified(user),
    edit: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    delete: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
  },

  displayArtistName: {
    edit: (user: User, display: DisplayPolicyResource) => isDisplayMember(user, display),
  },

  displayContent: {
    createCategory: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    editCategory: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    deleteCategory: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    // 이미 만들어진 카테고리에 사진을 추가하는 건 작가 인증 여부와 무관하게 전시 소속인이면 가능
    createContent: (user: User, display: DisplayPolicyResource) => isDisplayMember(user, display),
    editContent: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    deleteContent: (user: User, display: DisplayPolicyResource, content?: UserOwnedResource) =>
      canManageDisplay(user, display) ||
      (isDisplayMember(user, display) && content !== undefined && isOwner(user, content)),
    reorder: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
  },

  displayInvitation: {
    create: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
  },

  artwork: {
    create: (user: User, display: DisplayPolicyResource) =>
      isArtistVerified(user) && isDisplayMember(user, display),
    edit: (user: User, artwork: ArtworkPolicyResource, display: DisplayPolicyResource) =>
      canManageArtwork(user, artwork, display),
    delete: (user: User, artwork: ArtworkPolicyResource, display: DisplayPolicyResource) =>
      canManageArtwork(user, artwork, display),
    reorder: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
  },

  feeling: {
    create: (user: User) => isLoggedIn(user),
    delete: (user: User, feeling: UserOwnedResource, display: DisplayPolicyResource) =>
      canModerateDisplayPost(user, feeling, display),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    reply: {
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource, display: DisplayPolicyResource) =>
        canModerateDisplayPost(user, reply, display),
    },
  },

  displayReview: {
    create: (user: User) => isLoggedIn(user),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    delete: (user: User, review: UserOwnedResource, display: DisplayPolicyResource) =>
      canModerateDisplayPost(user, review, display),
    reply: {
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource, display: DisplayPolicyResource) =>
        canModerateDisplayPost(user, reply, display),
    },
  },

  personalArtwork: {
    create: (user: User) => isArtistVerified(user),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    edit: (user: User, personalArtwork: UserOwnedResource) =>
      isArtistVerified(user) && isOwner(user, personalArtwork),
    delete: (user: User, personalArtwork: UserOwnedResource) =>
      isArtistVerified(user) && isOwner(user, personalArtwork),
  },

  personalFeeling: {
    create: (user: User) => isLoggedIn(user),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    delete: (user: User, feeling: UserOwnedResource, personalArtwork: UserOwnedResource) =>
      canModeratePersonalPost(user, feeling, personalArtwork),
    reply: {
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource, personalArtwork: UserOwnedResource) =>
        canModeratePersonalPost(user, reply, personalArtwork),
    },
  },

  loungePost: {
    view: (user: User, post: LoungePostPolicyResource) => canViewLoungePost(user, post),
    create: (user: User) => isLoggedIn(user),
    edit: (user: User, post: MyResource) => isLoggedIn(user) && isMine(post),
    delete: (user: User, post: MyResource) => isLoggedIn(user) && isMine(post),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    scrap: (user: User) => isLoggedIn(user),
  },

  loungeComment: {
    create: (user: User) => isLoggedIn(user),
    delete: (user: User, comment: MyResource) => isLoggedIn(user) && isMine(comment),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
  },

  archive: {
    create: (user: User) => isLoggedIn(user),
    delete: (user: User) => isLoggedIn(user),
  },

  memo: {
    // 메모는 내가 저장한 아카이브 항목에서만 보이고 다룰 수 있음
    view: (user: User, archiveItem: UserOwnedResource) => isOwner(user, archiveItem),
    upsert: (user: User, archiveItem: UserOwnedResource) => isOwner(user, archiveItem),
    delete: (user: User, archiveItem: UserOwnedResource) => isOwner(user, archiveItem),
  },
} satisfies PolicyDefinitionMap;

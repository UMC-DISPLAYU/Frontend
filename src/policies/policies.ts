import type {
  ArtworkPolicyResource,
  DisplayPolicyResource,
  MyResource,
  PrivatableResource,
  UserOwnedResource,
} from '@/policies/util';
import {
  canManageArtwork,
  canManageDisplay,
  canModerateDisplayPost,
  canModeratePersonalPost,
  isArtistVerified,
  isDisplayMember,
  isDisplayOwner,
  isLoggedIn,
  isMine,
  isOwner,
  isPrivate,
  isQaHandler,
} from '@/policies/util';
import type { PolicyDefinitionMap, User } from '@/types/policy';

// 비공개 질문은 질문 작성자이거나 전시 소속인만 열람 가능
function canViewDisplayQuestion(
  user: User,
  question: UserOwnedResource & PrivatableResource,
  display: DisplayPolicyResource,
): boolean {
  if (!isPrivate(question)) return true;

  return isOwner(user, question) || (isArtistVerified(user) && isDisplayMember(user, display));
}

// 비공개 질문은 질문 작성자이거나 개인 작품 주인만 열람 가능
function canViewPersonalQuestion(
  user: User,
  question: UserOwnedResource & PrivatableResource,
  personalArtwork: UserOwnedResource,
): boolean {
  if (!isPrivate(question)) return true;

  return isOwner(user, question) || (isArtistVerified(user) && isOwner(user, personalArtwork));
}

export const policies = {
  artist: {
    view: (user: User) => isArtistVerified(user),
  },

  display: {
    create: (user: User) => isArtistVerified(user),
    edit: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    delete: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
  },

  displayArtistName: {
    edit: (user: User, display: DisplayPolicyResource) =>
      isArtistVerified(user) && isDisplayMember(user, display),
  },

  displayContent: {
    createCategory: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    editCategory: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    deleteCategory: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    createContent: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    editContent: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
    deleteContent: (user: User, display: DisplayPolicyResource) => canManageDisplay(user, display),
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

  question: {
    view: (
      user: User,
      question: UserOwnedResource & PrivatableResource,
      display: DisplayPolicyResource,
    ) => canViewDisplayQuestion(user, question, display),
    create: (user: User) => isLoggedIn(user),
    delete: (user: User, question: UserOwnedResource, display: DisplayPolicyResource) =>
      canModerateDisplayPost(user, question, display),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    reply: {
      view: (
        user: User,
        question: UserOwnedResource & PrivatableResource,
        display: DisplayPolicyResource,
      ) => canViewDisplayQuestion(user, question, display),
      // 답변은 전시 소유자이거나, 전시 소속인 중 해당 작품 QnA 담당자만 작성 가능
      create: (user: User, artwork: ArtworkPolicyResource, display: DisplayPolicyResource) =>
        isArtistVerified(user) &&
        (isDisplayOwner(user, display) ||
          (isDisplayMember(user, display) && isQaHandler(user, artwork))),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource, display: DisplayPolicyResource) =>
        canModerateDisplayPost(user, reply, display),
    },
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

  personalQuestion: {
    view: (
      user: User,
      question: UserOwnedResource & PrivatableResource,
      personalArtwork: UserOwnedResource,
    ) => canViewPersonalQuestion(user, question, personalArtwork),
    create: (user: User) => isLoggedIn(user),
    delete: (user: User, question: UserOwnedResource, personalArtwork: UserOwnedResource) =>
      canModeratePersonalPost(user, question, personalArtwork),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    reply: {
      view: (
        user: User,
        question: UserOwnedResource & PrivatableResource,
        personalArtwork: UserOwnedResource,
      ) => canViewPersonalQuestion(user, question, personalArtwork),
      // 개인 작품 질문은 작품 주인만 답변 가능
      create: (user: User, personalArtwork: UserOwnedResource) =>
        isArtistVerified(user) && isOwner(user, personalArtwork),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource) => isOwner(user, reply),
    },
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

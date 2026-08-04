import type {
  ArtworkPolicyResource,
  DisplayPolicyResource,
  MyResource,
  UserOwnedResource,
} from '@/policies/util';
import { canManageArtwork, isDisplayOwner, isLoggedIn, isMine, isOwner } from '@/policies/util';
import type { PolicyDefinitionMap, User } from '@/types/policy';

export const policies = {
  display: {
    view: () => true,
    edit: (user: User, display: DisplayPolicyResource) =>
      isLoggedIn(user) && user.id === display.ownerUserId,
    inviteMember: (user: User, display: DisplayPolicyResource) =>
      isLoggedIn(user) && user.id === display.ownerUserId,
    delete: (user: User, display: DisplayPolicyResource) =>
      isLoggedIn(user) && user.id === display.ownerUserId,
    forceDeleteArtwork: (user: User, display: DisplayPolicyResource) =>
      isLoggedIn(user) && user.id === display.ownerUserId,
  },

  displayContent: {
    createCategory: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    editCategory: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    deleteCategory: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    createContent: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    editContent: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    deleteContent: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    reorder: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
  },

  displayInvitation: {
    create: (user: User, display: DisplayPolicyResource) => isDisplayOwner(user, display),
    accept: (user: User, invitation: { inviteeUserId: number }) =>
      isLoggedIn(user) && user.id === invitation.inviteeUserId,
    reject: (user: User, invitation: { inviteeUserId: number }) =>
      isLoggedIn(user) && user.id === invitation.inviteeUserId,
  },

  artwork: {
    view: () => true,
    create: (user: User, display: DisplayPolicyResource) => {
      if (!isLoggedIn(user)) return false;
      return display.teamMembers.some((member) => member.userId === user.id && member.accepted);
    },
    edit: (user: User, artwork: ArtworkPolicyResource, display: DisplayPolicyResource) =>
      canManageArtwork(user, artwork, display),
    delete: (user: User, artwork: ArtworkPolicyResource, display: DisplayPolicyResource) =>
      canManageArtwork(user, artwork, display),
  },

  question: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    edit: (user: User, question: UserOwnedResource) => isOwner(user, question),
    delete: (user: User, question: UserOwnedResource) => isOwner(user, question),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    reply: {
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource) => isOwner(user, reply),
    },
  },

  feeling: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    edit: (user: User, feeling: UserOwnedResource) => isOwner(user, feeling),
    delete: (user: User, feeling: UserOwnedResource) => isOwner(user, feeling),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    reply: {
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource) => isOwner(user, reply),
    },
  },

  displayReview: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    delete: (user: User, review: UserOwnedResource) => isOwner(user, review),
    reply: {
      view: () => true,
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource) => isOwner(user, reply),
    },
  },

  personalArtwork: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    edit: (user: User, personalArtwork: UserOwnedResource) => isOwner(user, personalArtwork),
    delete: (user: User, personalArtwork: UserOwnedResource) => isOwner(user, personalArtwork),
  },

  personalQuestion: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    delete: (user: User, question: UserOwnedResource) => isOwner(user, question),
    reply: {
      create: (user: User, personalArtwork: UserOwnedResource) => isOwner(user, personalArtwork),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource) => isOwner(user, reply),
    },
  },

  personalFeeling: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    delete: (user: User, feeling: UserOwnedResource) => isOwner(user, feeling),
    reply: {
      create: (user: User) => isLoggedIn(user),
      like: (user: User) => isLoggedIn(user),
      unlike: (user: User) => isLoggedIn(user),
      delete: (user: User, reply: UserOwnedResource) => isOwner(user, reply),
    },
  },

  loungePost: {
    view: () => true,
    create: (user: User) => isLoggedIn(user),
    edit: (user: User, post: MyResource) => isLoggedIn(user) && isMine(post),
    delete: (user: User, post: MyResource) => isLoggedIn(user) && isMine(post),
    like: (user: User) => isLoggedIn(user),
    unlike: (user: User) => isLoggedIn(user),
    scrap: (user: User) => isLoggedIn(user),
    unscrap: (user: User) => isLoggedIn(user),
  },

  loungeComment: {
    view: () => true,
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
    upsert: (user: User, archiveItem: UserOwnedResource) => isOwner(user, archiveItem),
    delete: (user: User, archiveItem: UserOwnedResource) => isOwner(user, archiveItem),
  },
} satisfies PolicyDefinitionMap;

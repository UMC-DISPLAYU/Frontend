import { useEffect, useMemo } from 'react';

import type {
  ArchivedArtworkDto,
  ArtworkFeelingDto,
  ArtworkGuestbookReplyDto,
  ArtworkQuestionDto,
  DisplayDetailDto,
  DisplayInvitationDto,
  DisplayReviewDto,
  DisplayReviewReplyDto,
  GetArtworkDetailResponseDataDto,
  LoungeCommentDto,
  LoungePostDetailDto,
  LoungeReplyDto,
  PersonalArtworkFeelingReplyDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkQuestionReplyResponseDataDto,
  PersonalArtworkQuestionResponseDataDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { policies } from '@/policies/policies';
import { useAuthStore } from '@/stores/authStore';
import type { PermissionMap, PolicyAction, PolicyPermissionMap, User } from '@/types/policy';

//매 권한 로직 훅을 호출할 때 마다, 사용자 속성을 가져옴
function useCurrentPolicyUser(): User {
  const guest: User = {
    id: null,
    isArtistVerified: false,
  };
  const accessToken = useAuthStore((state) => state.accessToken);
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { data: me } = useUserMe({ enabled: Boolean(accessToken) });

  useEffect(() => {
    if (!accessToken || !me) return;

    setUser({
      id: me.id,
      isArtistVerified: me.isVerified,
    });
  }, [accessToken, me, setUser]);

  if (!accessToken) return guest;

  return storedUser ?? guest;
}

export function useDisplayPolicy(display: DisplayDetailDto): PolicyPermissionMap<'display'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.display.view(),
      edit: () => policies.display.edit(user, display),
      inviteMember: () => policies.display.inviteMember(user, display),
      delete: () => policies.display.delete(user, display),
      forceDeleteArtwork: () => policies.display.forceDeleteArtwork(user, display),
    }),
    [user, display],
  );
}

export function useDisplayContentPolicy(
  display: DisplayDetailDto,
): PolicyPermissionMap<'displayContent'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      createCategory: () => policies.displayContent.createCategory(user, display),
      editCategory: () => policies.displayContent.editCategory(user, display),
      deleteCategory: () => policies.displayContent.deleteCategory(user, display),
      createContent: () => policies.displayContent.createContent(user, display),
      editContent: () => policies.displayContent.editContent(user, display),
      deleteContent: () => policies.displayContent.deleteContent(user, display),
      reorder: () => policies.displayContent.reorder(user, display),
    }),
    [user, display],
  );
}

export function useDisplayInvitationPolicy(
  display: DisplayDetailDto,
  invitation?: DisplayInvitationDto,
): PolicyPermissionMap<'displayInvitation'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.displayInvitation.create(user, display),
      accept: () => (invitation ? policies.displayInvitation.accept(user, invitation) : false),
      reject: () => (invitation ? policies.displayInvitation.reject(user, invitation) : false),
    }),
    [user, display, invitation],
  );
}

export function useArtworkPolicy(
  display: DisplayDetailDto,
  artwork?: GetArtworkDetailResponseDataDto,
): PolicyPermissionMap<'artwork'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.artwork.view(),
      create: () => policies.artwork.create(user, display),
      edit: () => (artwork ? policies.artwork.edit(user, artwork, display) : false),
      delete: () => (artwork ? policies.artwork.delete(user, artwork, display) : false),
    }),
    [user, display, artwork],
  );
}

export function useQuestionPolicy(question: ArtworkQuestionDto): PolicyPermissionMap<'question'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.question.view(),
      create: () => policies.question.create(user),
      edit: () => policies.question.edit(user, question),
      delete: () => policies.question.delete(user, question),
      like: () => policies.question.like(user),
      unlike: () => policies.question.unlike(user),
      'reply.create': () => policies.question.reply.create(user),
      'reply.like': () => policies.question.reply.like(user),
      'reply.unlike': () => policies.question.reply.unlike(user),
      'reply.delete': (reply?: ArtworkGuestbookReplyDto) =>
        reply ? policies.question.reply.delete(user, reply) : false,
    }),
    [user, question],
  );
}

export function useFeelingPolicy(feeling?: ArtworkFeelingDto): PolicyPermissionMap<'feeling'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.feeling.view(),
      create: () => policies.feeling.create(user),
      edit: () => (feeling ? policies.feeling.edit(user, feeling) : false),
      delete: () => (feeling ? policies.feeling.delete(user, feeling) : false),
      like: () => policies.feeling.like(user),
      unlike: () => policies.feeling.unlike(user),
      'reply.create': () => policies.feeling.reply.create(user),
      'reply.like': () => policies.feeling.reply.like(user),
      'reply.unlike': () => policies.feeling.reply.unlike(user),
      'reply.delete': (reply?: ArtworkGuestbookReplyDto) =>
        reply ? policies.feeling.reply.delete(user, reply) : false,
    }),
    [user, feeling],
  );
}

type DisplayReviewPolicy = PermissionMap<Exclude<PolicyAction<'displayReview'>, `reply.${string}`>>;

type DisplayReviewReplyPolicy = PermissionMap<
  Extract<PolicyAction<'displayReview'>, `reply.${string}`>
>;

export function useDisplayReviewPolicy(review?: DisplayReviewDto): DisplayReviewPolicy {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.displayReview.view(),
      create: () => policies.displayReview.create(user),
      like: () => policies.displayReview.like(user),
      unlike: () => policies.displayReview.unlike(user),
      delete: () => (review ? policies.displayReview.delete(user, review) : false),
    }),
    [user, review],
  );
}

export function useDisplayReviewReplyPolicy(
  reply?: DisplayReviewReplyDto,
): DisplayReviewReplyPolicy {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      'reply.view': () => policies.displayReview.reply.view(),
      'reply.create': () => policies.displayReview.reply.create(user),
      'reply.like': () => policies.displayReview.reply.like(user),
      'reply.unlike': () => policies.displayReview.reply.unlike(user),
      'reply.delete': () => (reply ? policies.displayReview.reply.delete(user, reply) : false),
    }),
    [user, reply],
  );
}

export function usePersonalArtworkPolicy(
  personalArtwork?: PersonalArtworkResponseDataDto,
): PolicyPermissionMap<'personalArtwork'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.personalArtwork.view(),
      create: () => policies.personalArtwork.create(user),
      like: () => policies.personalArtwork.like(user),
      unlike: () => policies.personalArtwork.unlike(user),
      edit: () => (personalArtwork ? policies.personalArtwork.edit(user, personalArtwork) : false),
      delete: () =>
        personalArtwork ? policies.personalArtwork.delete(user, personalArtwork) : false,
    }),
    [user, personalArtwork],
  );
}

export function usePersonalQuestionPolicy(
  question?: PersonalArtworkQuestionResponseDataDto,
  personalArtwork?: PersonalArtworkResponseDataDto,
): PolicyPermissionMap<'personalQuestion'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.personalQuestion.view(),
      create: () => policies.personalQuestion.create(user),
      delete: () => (question ? policies.personalQuestion.delete(user, question) : false),
      'reply.create': () =>
        personalArtwork ? policies.personalQuestion.reply.create(user, personalArtwork) : false,
      'reply.like': () => policies.personalQuestion.reply.like(user),
      'reply.unlike': () => policies.personalQuestion.reply.unlike(user),
      'reply.delete': (reply?: PersonalArtworkQuestionReplyResponseDataDto) =>
        reply ? policies.personalQuestion.reply.delete(user, reply) : false,
    }),
    [user, question, personalArtwork],
  );
}

export function usePersonalFeelingPolicy(
  feeling?: PersonalArtworkFeelingResponseDataDto,
): PolicyPermissionMap<'personalFeeling'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.personalFeeling.view(),
      create: () => policies.personalFeeling.create(user),
      like: () => policies.personalFeeling.like(user),
      unlike: () => policies.personalFeeling.unlike(user),
      delete: () => (feeling ? policies.personalFeeling.delete(user, feeling) : false),
      'reply.create': () => policies.personalFeeling.reply.create(user),
      'reply.like': () => policies.personalFeeling.reply.like(user),
      'reply.unlike': () => policies.personalFeeling.reply.unlike(user),
      'reply.delete': (reply?: PersonalArtworkFeelingReplyDto) =>
        reply ? policies.personalFeeling.reply.delete(user, reply) : false,
    }),
    [user, feeling],
  );
}

export function useLoungePostPolicy(
  post?: Pick<LoungePostDetailDto, 'isMyPost'>,
): PolicyPermissionMap<'loungePost'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.loungePost.view(),
      create: () => policies.loungePost.create(user),
      edit: () => (post ? policies.loungePost.edit(user, post) : false),
      delete: () => (post ? policies.loungePost.delete(user, post) : false),
      like: () => policies.loungePost.like(user),
      unlike: () => policies.loungePost.unlike(user),
      scrap: () => policies.loungePost.scrap(user),
      unscrap: () => policies.loungePost.unscrap(user),
    }),
    [user, post],
  );
}

export function useLoungeCommentPolicy(
  comment?: Pick<LoungeCommentDto | LoungeReplyDto, 'isMyComment'>,
): PolicyPermissionMap<'loungeComment'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.loungeComment.view(),
      create: () => policies.loungeComment.create(user),
      delete: () => (comment ? policies.loungeComment.delete(user, comment) : false),
      like: () => policies.loungeComment.like(user),
      unlike: () => policies.loungeComment.unlike(user),
    }),
    [user, comment],
  );
}

export function useArchivePolicy(): PolicyPermissionMap<'archive'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.archive.create(user),
      delete: () => policies.archive.delete(user),
    }),
    [user],
  );
}

export const useArchiveDisplayPolicy = useArchivePolicy;
export const useArchiveArtworkPolicy = useArchivePolicy;
export const useArchiveArtistPolicy = useArchivePolicy;

export function useMemoPolicy(
  archiveItem?: Pick<ArchivedArtworkDto, 'userId'>,
): PolicyPermissionMap<'memo'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      upsert: () => (archiveItem ? policies.memo.upsert(user, archiveItem) : false),
      delete: () => (archiveItem ? policies.memo.delete(user, archiveItem) : false),
    }),
    [user, archiveItem],
  );
}

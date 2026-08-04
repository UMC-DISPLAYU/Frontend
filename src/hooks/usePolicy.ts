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
import type { DisplayPolicyResource } from '@/policies/util';
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

export function useDisplayPolicy(display: DisplayPolicyResource): PolicyPermissionMap<'display'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.display.create(user),
      edit: () => policies.display.edit(user, display),
      delete: () => policies.display.delete(user, display),
    }),
    [user, display],
  );
}

export function useArtistPolicy(): PolicyPermissionMap<'artist'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.artist.view(user),
    }),
    [user],
  );
}

export function useDisplayArtistNamePolicy(
  display: DisplayPolicyResource,
): PolicyPermissionMap<'displayArtistName'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      edit: () => policies.displayArtistName.edit(user, display),
    }),
    [user, display],
  );
}

// 전시 생성은 대상 전시가 아직 없으므로 별도 훅으로 제공
export function useDisplayCreatePolicy(): PermissionMap<'create'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.display.create(user),
    }),
    [user],
  );
}

export function useDisplayContentPolicy(
  display?: DisplayPolicyResource,
): PolicyPermissionMap<'displayContent'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      createCategory: () =>
        display ? policies.displayContent.createCategory(user, display) : false,
      editCategory: () => (display ? policies.displayContent.editCategory(user, display) : false),
      deleteCategory: () =>
        display ? policies.displayContent.deleteCategory(user, display) : false,
      createContent: () => (display ? policies.displayContent.createContent(user, display) : false),
      editContent: () => (display ? policies.displayContent.editContent(user, display) : false),
      deleteContent: () => (display ? policies.displayContent.deleteContent(user, display) : false),
      reorder: () => (display ? policies.displayContent.reorder(user, display) : false),
    }),
    [user, display],
  );
}

export function useDisplayInvitationPolicy(
  display: DisplayPolicyResource,
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
      create: () => policies.artwork.create(user, display),
      edit: () => (artwork ? policies.artwork.edit(user, artwork, display) : false),
      delete: () => (artwork ? policies.artwork.delete(user, artwork, display) : false),
    }),
    [user, display, artwork],
  );
}

export function useQuestionPolicy(
  question: ArtworkQuestionDto,
  display: DisplayDetailDto,
): PermissionMap<Exclude<PolicyAction<'question'>, `reply.${string}`>> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      view: () => policies.question.view(user, question, display),
      create: () => policies.question.create(user),
      delete: () => policies.question.delete(user, question, display),
      like: () => policies.question.like(user),
      unlike: () => policies.question.unlike(user),
    }),
    [user, question, display],
  );
}

export function useQuestionReplyPolicy(
  question: ArtworkQuestionDto,
  display: DisplayDetailDto,
  artwork?: GetArtworkDetailResponseDataDto,
  reply?: ArtworkGuestbookReplyDto | null,
): PermissionMap<Extract<PolicyAction<'question'>, `reply.${string}`>> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      'reply.view': () => policies.question.reply.view(user, question, display),
      'reply.create': () =>
        artwork ? policies.question.reply.create(user, artwork, display) : false,
      'reply.like': () => policies.question.reply.like(user),
      'reply.unlike': () => policies.question.reply.unlike(user),
      'reply.delete': () => (reply ? policies.question.reply.delete(user, reply, display) : false),
    }),
    [user, question, display, artwork, reply],
  );
}

export function useFeelingPolicy(
  display: DisplayDetailDto,
  feeling?: ArtworkFeelingDto,
): PermissionMap<Exclude<PolicyAction<'feeling'>, `reply.${string}`>> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.feeling.create(user),
      delete: () => (feeling ? policies.feeling.delete(user, feeling, display) : false),
      like: () => policies.feeling.like(user),
      unlike: () => policies.feeling.unlike(user),
    }),
    [user, display, feeling],
  );
}

export function useFeelingReplyPolicy(
  display: DisplayDetailDto,
  reply?: ArtworkGuestbookReplyDto,
): PermissionMap<Extract<PolicyAction<'feeling'>, `reply.${string}`>> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      'reply.create': () => policies.feeling.reply.create(user),
      'reply.like': () => policies.feeling.reply.like(user),
      'reply.unlike': () => policies.feeling.reply.unlike(user),
      'reply.delete': () => (reply ? policies.feeling.reply.delete(user, reply, display) : false),
    }),
    [user, display, reply],
  );
}

type DisplayReviewPolicy = PermissionMap<Exclude<PolicyAction<'displayReview'>, `reply.${string}`>>;

type DisplayReviewReplyPolicy = PermissionMap<
  Extract<PolicyAction<'displayReview'>, `reply.${string}`>
>;

export function useDisplayReviewPolicy(
  display?: DisplayPolicyResource,
  review?: DisplayReviewDto,
): DisplayReviewPolicy {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.displayReview.create(user),
      like: () => policies.displayReview.like(user),
      unlike: () => policies.displayReview.unlike(user),
      delete: () =>
        review && display ? policies.displayReview.delete(user, review, display) : false,
    }),
    [user, display, review],
  );
}

export function useDisplayReviewReplyPolicy(
  display?: DisplayPolicyResource,
  reply?: DisplayReviewReplyDto,
): DisplayReviewReplyPolicy {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      'reply.create': () => policies.displayReview.reply.create(user),
      'reply.like': () => policies.displayReview.reply.like(user),
      'reply.unlike': () => policies.displayReview.reply.unlike(user),
      'reply.delete': () =>
        reply && display ? policies.displayReview.reply.delete(user, reply, display) : false,
    }),
    [user, display, reply],
  );
}

export function usePersonalArtworkPolicy(
  personalArtwork?: PersonalArtworkResponseDataDto,
): PolicyPermissionMap<'personalArtwork'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
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
      view: () =>
        question && personalArtwork
          ? policies.personalQuestion.view(user, question, personalArtwork)
          : true,
      create: () => policies.personalQuestion.create(user),
      delete: () =>
        question && personalArtwork
          ? policies.personalQuestion.delete(user, question, personalArtwork)
          : false,
      like: () => policies.personalQuestion.like(user),
      unlike: () => policies.personalQuestion.unlike(user),
      'reply.view': () =>
        question && personalArtwork
          ? policies.personalQuestion.reply.view(user, question, personalArtwork)
          : true,
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
  personalArtwork?: PersonalArtworkResponseDataDto,
): PolicyPermissionMap<'personalFeeling'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.personalFeeling.create(user),
      like: () => policies.personalFeeling.like(user),
      unlike: () => policies.personalFeeling.unlike(user),
      delete: () =>
        feeling && personalArtwork
          ? policies.personalFeeling.delete(user, feeling, personalArtwork)
          : false,
      'reply.create': () => policies.personalFeeling.reply.create(user),
      'reply.like': () => policies.personalFeeling.reply.like(user),
      'reply.unlike': () => policies.personalFeeling.reply.unlike(user),
      'reply.delete': (reply?: PersonalArtworkFeelingReplyDto) =>
        reply && personalArtwork
          ? policies.personalFeeling.reply.delete(user, reply, personalArtwork)
          : false,
    }),
    [user, feeling, personalArtwork],
  );
}

export function useLoungePostPolicy(
  post?: Pick<LoungePostDetailDto, 'isMyPost'>,
): PolicyPermissionMap<'loungePost'> {
  const user = useCurrentPolicyUser();

  return useMemo(
    () => ({
      create: () => policies.loungePost.create(user),
      edit: () => (post ? policies.loungePost.edit(user, post) : false),
      delete: () => (post ? policies.loungePost.delete(user, post) : false),
      like: () => policies.loungePost.like(user),
      unlike: () => policies.loungePost.unlike(user),
      scrap: () => policies.loungePost.scrap(user),
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
      view: () => (archiveItem ? policies.memo.view(user, archiveItem) : false),
      upsert: () => (archiveItem ? policies.memo.upsert(user, archiveItem) : false),
      delete: () => (archiveItem ? policies.memo.delete(user, archiveItem) : false),
    }),
    [user, archiveItem],
  );
}

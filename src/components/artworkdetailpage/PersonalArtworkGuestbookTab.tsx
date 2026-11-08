import { useCallback, useState } from 'react';

import type { PersonalArtworkResponseDataDto } from '@/api/dto';
import { BottomCommentBar } from '@/components/common/BottomCommentBar';
import {
  useCreatePersonalArtworkFeeling,
  useCreatePersonalArtworkFeelingReply,
  usePersonalArtworkFeelings,
} from '@/hooks/queries/usePersonalArtwork';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { usePersonalFeelingPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

import { GuestbookSkeleton } from './ArtworkGuestbookTab';
import { PersonalFeelingCommentItem } from './PersonalFeelingCommentItem';

type Props = {
  artwork: PersonalArtworkResponseDataDto;
  myUserId?: number;
};

export function PersonalArtworkGuestbookTab({ artwork, myUserId }: Props) {
  const personalArtworkId = artwork.personalArtworkId;
  const { data, isPending } = usePersonalArtworkFeelings(personalArtworkId);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const feelingPolicy = usePersonalFeelingPolicy(undefined, artwork);

  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(
    null,
  );
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const createFeeling = useCreatePersonalArtworkFeeling(personalArtworkId);
  const createFeelingReply = useCreatePersonalArtworkFeelingReply(
    personalArtworkId,
    replyTarget?.commentId ?? 0,
  );

  const clearReplyTarget = () => {
    setReplyTarget(null);
    setActiveReplyId(null);
  };
  const handleReplyClick = useCallback((commentId: number, author: string, highlightId: string) => {
    setReplyTarget({ commentId, author });
    setActiveReplyId(highlightId);
  }, []);

  /* 답글 없는 삭제된 감상은 목록에서 완전히 제외 (답글이 있으면 삭제 안내로 표시) */
  const feelings = (data?.feelings ?? []).filter(
    (feeling) => !(feeling.isDeleted && (feeling.replyCount ?? 0) === 0),
  );

  return (
    <div className="px-gutter py-2 desktop:px-0">
      {isPending && <GuestbookSkeleton />}

      {!isPending && feelings.length === 0 && (
        <p className="typography-body-lg-medium py-10 text-center text-tertiary">
          아직 방명록이 없어요
        </p>
      )}

      <div className="flex flex-col">
        {feelings.map((feeling) => (
          <PersonalFeelingCommentItem
            key={feeling.personalFeelingId}
            personalArtworkId={personalArtworkId}
            feeling={feeling}
            artwork={artwork}
            myUserId={myUserId}
            activeReplyId={activeReplyId}
            onReplyClick={handleReplyClick}
          />
        ))}
      </div>

      <BottomCommentBar
        placement="page"
        imageDomain="personal-artwork-feeling"
        replyingTo={replyTarget?.author}
        onCancelReply={clearReplyTarget}
        isSubmitting={createFeeling.isPending || createFeelingReply.isPending}
        onSubmit={async ({ content, images }) => {
          if (!content.trim() && images.length === 0) return false;
          const finalContent = content.trim() || '.';
          const formattedImages = images.map((image, index) => ({
            imageUrl: image.imageUrl,
            width: Math.round(image.width) || 0,
            height: Math.round(image.height) || 0,
            sortOrder: index + 1,
          }));

          if (replyTarget) {
            if (!hasPermission(feelingPolicy, 'reply.create')) {
              openLoginModal();
              return false;
            }
            await createFeelingReply.mutateAsync(
              { content: finalContent, images: formattedImages },
              { onSuccess: clearReplyTarget },
            );
            return;
          }

          if (!hasPermission(feelingPolicy, 'create')) {
            openLoginModal();
            return false;
          }
          await createFeeling.mutateAsync({ content: finalContent, images: formattedImages });
        }}
      />
      {loginModal}
    </div>
  );
}

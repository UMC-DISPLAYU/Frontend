import { useCallback, useState } from 'react';

import { Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import type { PersonalArtworkQuestionResponseDataDto } from '@/api/dto';
import type { ArtworkDetailTabKey } from '@/components/artworkdetailpage/ArtworkTabNav';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { PersonalArtworkIntroTab } from '@/components/artworkdetailpage/PersonalArtworkIntroTab';
import { PersonalArtworkMeta } from '@/components/artworkdetailpage/PersonalArtworkMeta';
import {
  PersonalArtworkQuestionCard,
  PersonalArtworkQuestionComposerCard,
} from '@/components/artworkdetailpage/PersonalArtworkQuestionCard';
import { PersonalArtworkSaveButton } from '@/components/artworkdetailpage/PersonalArtworkSaveButton';
import { PersonalFeelingCommentItem } from '@/components/artworkdetailpage/PersonalFeelingCommentItem';
import { BottomCommentBar, ErrorView, LoadingView } from '@/components/common';
import { BottomFixedBar } from '@/components/displaydetailpage';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { FALLBACK_POSTER_IMAGE } from '@/constants';
import {
  useCreatePersonalArtworkFeeling,
  useCreatePersonalArtworkFeelingReply,
  useCreatePersonalArtworkQuestion,
  useCreatePersonalArtworkQuestionReply,
  usePersonalArtwork,
  usePersonalArtworkFeelings,
  usePersonalArtworkQuestions,
} from '@/hooks/queries/usePersonalArtwork';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { usePersonalFeelingPolicy, usePersonalQuestionPolicy } from '@/hooks/usePolicy';
import { hasPermission } from '@/utils/hasPermission';

function formatImageUrls(images: { imageUrl?: string }[] = []) {
  return images.map((image) => image.imageUrl).filter((url): url is string => Boolean(url));
}

export function PersonalArtworkDetailPage() {
  const navigate = useNavigate();
  const { personalArtworkId: idParam } = useParams<{ personalArtworkId: string }>();
  const personalArtworkId = Number(idParam ?? 0);
  const [activeTab, setActiveTab] = useState<ArtworkDetailTabKey>('intro');

  /* 감상 답글 대상 — 전시상세/작품상세와 동일한 패턴(공용 BottomCommentBar가 씀) */
  const [feelingReplyTarget, setFeelingReplyTarget] = useState<{
    commentId: number;
    author: string;
  } | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const clearFeelingReplyTarget = () => {
    setFeelingReplyTarget(null);
    setActiveReplyId(null);
  };
  const handleFeelingReplyClick = useCallback(
    (commentId: number, author: string, highlightId: string) => {
      setFeelingReplyTarget({ commentId, author });
      setActiveReplyId(highlightId);
    },
    [],
  );

  /* 질문 답변 대상 — 기존 그대로 유지 */
  const [replyQuestion, setReplyQuestion] = useState<PersonalArtworkQuestionResponseDataDto | null>(
    null,
  );
  /* 질문 탭 진입 시 입력창을 바로 띄우지 않고, "+" 클릭 시에만 새 질문 작성 모드로 엽니다. */
  const [isComposingQuestion, setIsComposingQuestion] = useState(false);

  const { data: artwork, isPending, isError } = usePersonalArtwork(personalArtworkId);
  const { data: feelings } = usePersonalArtworkFeelings(personalArtworkId);
  const { data: questions } = usePersonalArtworkQuestions(personalArtworkId);
  const { data: userMe } = useUserMe();
  const myUserId = userMe?.id;
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  const feelingPolicy = usePersonalFeelingPolicy(undefined, artwork);
  const questionPolicy = usePersonalQuestionPolicy(undefined, artwork);
  const createFeeling = useCreatePersonalArtworkFeeling(personalArtworkId);
  const createQuestion = useCreatePersonalArtworkQuestion(personalArtworkId);
  const createFeelingReply = useCreatePersonalArtworkFeelingReply(
    personalArtworkId,
    feelingReplyTarget?.commentId ?? 0,
  );
  const createQuestionReply = useCreatePersonalArtworkQuestionReply(
    personalArtworkId,
    replyQuestion?.personalQuestionId ?? 0,
  );

  if (isPending) return <LoadingView message="작품 정보를 불러오는 중..." />;
  if (isError || !artwork) {
    return (
      <ErrorView
        title="작품 정보를 찾을 수 없습니다"
        message="요청하신 작품 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  /* 히어로는 작품 이미지만 사용합니다(작업과정 이미지는 소개 탭에서 별도로 씁니다). */
  const artworkImages = artwork.images.filter((image) => image.imageType !== 'WORK_PROCESS');
  const heroImages = formatImageUrls(artworkImages);
  const displayHeroImages = heroImages.length > 0 ? heroImages : [FALLBACK_POSTER_IMAGE];
  const feelingItems = feelings?.feelings;
  const questionItems = questions?.questions;

  /* 답변 대상이 있으면 답변으로, 없으면 새 질문으로 등록합니다. */
  const handleSendQuestion = (payload: { content: string; isPrivate: boolean }) => {
    if (!payload.content) return;

    if (replyQuestion) {
      if (!hasPermission(questionPolicy, 'reply.create')) {
        openLoginModal();
        return;
      }
      createQuestionReply.mutate(payload.content, { onSuccess: () => setReplyQuestion(null) });
      return;
    }

    if (!hasPermission(questionPolicy, 'create')) {
      openLoginModal();
      return;
    }
    createQuestion.mutate(
      { content: payload.content, isPublic: !payload.isPrivate },
      { onSuccess: () => setIsComposingQuestion(false) },
    );
  };

  const handleSend = ({
    content,
    images,
  }: {
    content: string;
    images: { imageUrl: string; width: number; height: number }[];
    isPrivate: boolean;
  }) => {
    if (!content) return;

    if (feelingReplyTarget) {
      if (!hasPermission(feelingPolicy, 'reply.create')) {
        openLoginModal();
        return;
      }
      createFeelingReply.mutate({ content, images }, { onSuccess: clearFeelingReplyTarget });
      return;
    }

    if (!hasPermission(feelingPolicy, 'create')) {
      openLoginModal();
      return;
    }
    createFeeling.mutate({ content, images });
  };

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md bg-page">
      {/* 히어로 이미지 */}
      <HeroSlider images={displayHeroImages} onBack={() => navigate(-1)} />

      {/* 작품 메타 (제목, 작가, 제작 정보) */}
      <PersonalArtworkMeta artwork={artwork} />

      {/* 소개 / 방명록 / 질문 탭 */}
      <ArtworkTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && <PersonalArtworkIntroTab artwork={artwork} />}

      {activeTab === 'review' && (
        <div className="px-5 pt-4 pb-comment-bar-offset">
          <div className="pb-4">
            <h2 className="typo-body-xl-bold text-main">감상 후기</h2>
          </div>
          <div className="flex flex-col">
            {feelingItems?.map((feeling) => (
              <PersonalFeelingCommentItem
                key={feeling.personalFeelingId}
                personalArtworkId={personalArtworkId}
                feeling={feeling}
                artwork={artwork}
                myUserId={myUserId}
                activeReplyId={activeReplyId}
                onReplyClick={handleFeelingReplyClick}
              />
            ))}
          </div>
          {!feelingItems?.length && (
            <p className="typo-body-sm-regular text-faint text-center py-10">
              아직 감상 후기가 없습니다.
            </p>
          )}
        </div>
      )}

      {activeTab === 'question' && (
        <div className="pt-4 pb-comment-bar-offset">
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="typo-body-xl-bold text-main">질문하기</h2>
            <button
              type="button"
              aria-label="질문 작성"
              onClick={() => {
                setReplyQuestion(null);
                setIsComposingQuestion(true);
              }}
              className="mr-[15px] cursor-pointer"
            >
              <Plus size={17} strokeWidth={2} className="text-main" />
            </button>
          </div>
          <div className="flex flex-col">
            {isComposingQuestion && (
              <PersonalArtworkQuestionComposerCard
                onClose={() => setIsComposingQuestion(false)}
                onSubmit={handleSendQuestion}
                isSubmitting={createQuestion.isPending}
              />
            )}
            {questionItems?.map((question) => (
              <PersonalArtworkQuestionCard
                key={question.personalQuestionId}
                question={question}
                artwork={artwork}
                isReplyTarget={replyQuestion?.personalQuestionId === question.personalQuestionId}
                onReply={() =>
                  setReplyQuestion((prev) =>
                    prev?.personalQuestionId === question.personalQuestionId ? null : question,
                  )
                }
                onSubmitReply={(content) => handleSendQuestion({ content, isPrivate: false })}
                isSubmittingReply={createQuestionReply.isPending}
              />
            ))}
          </div>
          {!questionItems?.length && !isComposingQuestion && (
            <p className="typo-body-sm-regular text-faint text-center px-5 py-10">
              아직 질문이 없습니다.
            </p>
          )}
        </div>
      )}

      {activeTab === 'intro' && (
        <BottomFixedBar
          button={
            <PersonalArtworkSaveButton
              className="w-full"
              personalArtworkId={personalArtworkId}
              saved={artwork.isArchived ?? false}
            />
          }
          shareTitle={artwork.artworkName}
          shareImageUrl={displayHeroImages[0]}
        />
      )}

      {activeTab === 'review' && (
        <BottomCommentBar
          imageDomain="personal-artwork-feeling"
          replyingTo={feelingReplyTarget?.author}
          onCancelReply={clearFeelingReplyTarget}
          isSubmitting={createFeeling.isPending || createFeelingReply.isPending}
          onSubmit={handleSend}
        />
      )}
      {loginModal}
    </div>
  );
}

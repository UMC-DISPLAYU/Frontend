import { useState } from 'react';

import { Heart, Lock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import type {
  PersonalArtworkFeelingReplyDto,
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkQuestionReplyResponseDataDto,
  PersonalArtworkQuestionResponseDataDto,
} from '@/api/dto';
import { BottomCommentBar, ErrorView, LoadingView } from '@/components/common';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { FALLBACK_POSTER_IMAGE, FALLBACK_PROFILE_IMAGE } from '@/constants';
import {
  useCreatePersonalArtworkFeeling,
  useCreatePersonalArtworkFeelingReply,
  useCreatePersonalArtworkQuestion,
  useCreatePersonalArtworkQuestionReply,
  useDeletePersonalArtworkFeeling,
  useDeletePersonalArtworkFeelingReply,
  useDeletePersonalArtworkQuestion,
  useDeletePersonalArtworkQuestionReply,
  usePersonalArtwork,
  usePersonalArtworkFeelingReplies,
  usePersonalArtworkFeelings,
  usePersonalArtworkQuestionReply,
  usePersonalArtworkQuestions,
  useTogglePersonalArtworkFeelingLike,
  useTogglePersonalArtworkFeelingReplyLike,
  useTogglePersonalArtworkQuestionLike,
  useTogglePersonalArtworkQuestionReplyLike,
} from '@/hooks/queries/usePersonalArtwork';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import {
  usePersonalFeelingPolicy,
  usePersonalFeelingReplyPolicy,
  usePersonalQuestionPolicy,
  usePersonalQuestionReplyPolicy,
} from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

type SubTab = 'review' | 'question';

function formatImageUrls(images: { imageUrl?: string }[] = []) {
  return images.map((image) => image.imageUrl).filter((url): url is string => Boolean(url));
}

function renderCount(count: number | undefined) {
  return typeof count === 'number' ? <span>{count}</span> : null;
}

function ProfileImage({ src }: { src?: string | null }) {
  return (
    <img
      src={src || FALLBACK_PROFILE_IMAGE}
      alt=""
      className="size-7 rounded-full object-cover"
      onError={(event) => {
        event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
      }}
    />
  );
}

function PersonalFeelingReplyItem({
  artwork,
  feelingId,
  reply,
}: {
  artwork: NonNullable<ReturnType<typeof usePersonalArtwork>['data']>;
  feelingId: number;
  reply: PersonalArtworkFeelingReplyDto;
}) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const replyPolicy = usePersonalFeelingReplyPolicy(artwork, reply);
  const canDelete = hasPermission(replyPolicy, 'reply.delete');
  const canToggleLike = hasPermission(replyPolicy, reply.isLiked ? 'reply.unlike' : 'reply.like');
  const deleteReply = useDeletePersonalArtworkFeelingReply(artwork.personalArtworkId, feelingId);
  const toggleLike = useTogglePersonalArtworkFeelingReplyLike(artwork.personalArtworkId, feelingId);

  const handleLike = () => {
    if (!canToggleLike) {
      openLoginModal();
      return;
    }

    toggleLike.mutate(reply.personalFeelingReplyId);
  };

  return (
    <div className="ml-9 border-t border-line py-3">
      <div className="mb-1 flex items-center gap-2">
        {reply.nickname && <span className="typo-body-sm-bold text-main">{reply.nickname}</span>}
        <span className="typo-body-xs-regular text-faint">{reply.createdAt}</span>
      </div>
      <p className="typo-body-xs-regular whitespace-pre-line text-sub600">{reply.content}</p>
      <div className="mt-2 flex items-center justify-between typo-body-xs-regular text-hint">
        {canDelete ? (
          <button type="button" onClick={() => deleteReply.mutate(reply.personalFeelingReplyId)}>
            삭제
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={handleLike} className="flex items-center gap-1">
          <Heart size={14} />
          {renderCount(reply.likeCount)}
        </button>
      </div>
      {loginModal}
    </div>
  );
}

function PersonalFeelingReplies({
  artwork,
  feelingId,
}: {
  artwork: NonNullable<ReturnType<typeof usePersonalArtwork>['data']>;
  feelingId: number;
}) {
  const { data } = usePersonalArtworkFeelingReplies(artwork.personalArtworkId, feelingId);

  return data?.replies.map((reply) => (
    <PersonalFeelingReplyItem
      key={reply.personalFeelingReplyId}
      artwork={artwork}
      feelingId={feelingId}
      reply={reply}
    />
  ));
}

function PersonalQuestionReply({
  artwork,
  reply,
}: {
  artwork: NonNullable<ReturnType<typeof usePersonalArtwork>['data']>;
  reply: PersonalArtworkQuestionReplyResponseDataDto;
}) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const replyPolicy = usePersonalQuestionReplyPolicy(reply);
  const canDelete = hasPermission(replyPolicy, 'reply.delete');
  const canToggleLike = hasPermission(replyPolicy, reply.isLiked ? 'reply.unlike' : 'reply.like');
  const deleteReply = useDeletePersonalArtworkQuestionReply(
    artwork.personalArtworkId,
    reply.personalQuestionId,
  );
  const toggleLike = useTogglePersonalArtworkQuestionReplyLike(
    artwork.personalArtworkId,
    reply.personalQuestionId,
  );

  const handleLike = () => {
    if (!canToggleLike) {
      openLoginModal();
      return;
    }

    toggleLike.mutate(reply.personalQuestionReplyId);
  };

  return (
    <div className="ml-9 border-t border-line py-3">
      <div className="mb-1 flex items-center gap-2">
        {reply.nickname && <span className="typo-body-sm-bold text-main">{reply.nickname}</span>}
        <span className="typo-body-xs-regular text-faint">{reply.createdAt}</span>
      </div>
      <p className="typo-body-xs-regular whitespace-pre-line text-sub600">{reply.content}</p>
      <div className="mt-2 flex items-center justify-between typo-body-xs-regular text-hint">
        {canDelete ? (
          <button type="button" onClick={() => deleteReply.mutate(reply.personalQuestionReplyId)}>
            삭제
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={handleLike} className="flex items-center gap-1">
          <Heart size={14} />
          {renderCount(reply.likeCount)}
        </button>
      </div>
      {loginModal}
    </div>
  );
}

function PersonalReviewCard({
  feeling,
  artwork,
  isReplyTarget,
  onReply,
}: {
  feeling: PersonalArtworkFeelingResponseDataDto;
  artwork: NonNullable<ReturnType<typeof usePersonalArtwork>['data']>;
  isReplyTarget: boolean;
  onReply: () => void;
}) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const feelingPolicy = usePersonalFeelingPolicy(feeling, artwork);
  const canDelete = hasPermission(feelingPolicy, 'delete');
  const canToggleLike = hasPermission(feelingPolicy, feeling.isLiked ? 'unlike' : 'like');
  const canCreateReply = hasPermission(feelingPolicy, 'reply.create');
  const deleteFeeling = useDeletePersonalArtworkFeeling(artwork.personalArtworkId);
  const toggleLike = useTogglePersonalArtworkFeelingLike(artwork.personalArtworkId);

  const handleReply = () => {
    if (!canCreateReply) {
      openLoginModal();
      return;
    }

    onReply();
  };

  const handleLike = () => {
    if (!canToggleLike) {
      openLoginModal();
      return;
    }

    toggleLike.mutate(feeling.personalFeelingId);
  };

  return (
    <article className={cn('border-b border-line py-3', isReplyTarget && '-mx-5 bg-box100 px-5')}>
      <div className="flex items-start gap-2">
        <ProfileImage src={feeling.profileImageUrl} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {feeling.nickname && (
              <span className="typo-body-sm-bold text-main">{feeling.nickname}</span>
            )}
            <span className="typo-body-xs-regular text-faint">{feeling.createdAt}</span>
          </div>
          <p className="typo-body-xs-regular whitespace-pre-line text-sub600">{feeling.content}</p>
          <div className="mt-3 flex items-center justify-between typo-body-xs-regular text-hint">
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleReply}>
                답글달기
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => deleteFeeling.mutate(feeling.personalFeelingId)}
                >
                  삭제
                </button>
              )}
            </div>
            <button type="button" onClick={handleLike} className="flex items-center gap-1">
              <Heart size={14} />
              {renderCount(feeling.likeCount)}
            </button>
          </div>
        </div>
      </div>
      <PersonalFeelingReplies artwork={artwork} feelingId={feeling.personalFeelingId} />
      {loginModal}
    </article>
  );
}

function PersonalQuestionCard({
  question,
  artwork,
  isArtistView,
  isReplyTarget,
  onReply,
}: {
  question: PersonalArtworkQuestionResponseDataDto;
  artwork: NonNullable<ReturnType<typeof usePersonalArtwork>['data']>;
  isArtistView: boolean;
  isReplyTarget: boolean;
  onReply: () => void;
}) {
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const questionPolicy = usePersonalQuestionPolicy(question, artwork);
  const replyPolicy = usePersonalQuestionPolicy(question, artwork);
  const canView = hasPermission(questionPolicy, 'view');
  const canDelete = hasPermission(questionPolicy, 'delete');
  const canToggleLike = hasPermission(questionPolicy, question.isLiked ? 'unlike' : 'like');
  const canCreateReply = hasPermission(replyPolicy, 'reply.create');
  const deleteQuestion = useDeletePersonalArtworkQuestion(artwork.personalArtworkId);
  const toggleQuestionLike = useTogglePersonalArtworkQuestionLike(artwork.personalArtworkId);
  const { data: reply } = usePersonalArtworkQuestionReply(
    artwork.personalArtworkId,
    canView ? question.personalQuestionId : 0,
  );

  const handleReply = () => {
    if (!canCreateReply) {
      openLoginModal();
      return;
    }

    onReply();
  };

  const handleLike = () => {
    if (!canToggleLike) {
      openLoginModal();
      return;
    }

    toggleQuestionLike.mutate(question.personalQuestionId);
  };

  if (!canView) {
    return (
      <article className="border-b border-line py-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-main" />
          <span className="typo-body-sm-bold text-main">비공개 질문입니다.</span>
        </div>
      </article>
    );
  }

  return (
    <article className={cn('border-b border-line py-3', isReplyTarget && '-mx-5 bg-box100 px-5')}>
      <div className="flex items-start gap-2">
        <ProfileImage src={question.profileImageUrl} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {question.nickname && (
                <span className="typo-body-sm-bold text-main">{question.nickname}</span>
              )}
              <span className="typo-body-xs-regular text-faint">{question.createdAt}</span>
            </div>
            {!question.isPublic && <Lock size={16} className="text-main" />}
          </div>
          <p className="typo-body-xs-regular whitespace-pre-line text-sub600">{question.content}</p>
          <div className="mt-3 flex items-center justify-between typo-body-xs-regular text-hint">
            <div className="flex items-center gap-2">
              {isArtistView && canCreateReply && !reply && (
                <button type="button" onClick={handleReply}>
                  답글달기
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => deleteQuestion.mutate(question.personalQuestionId)}
                >
                  삭제
                </button>
              )}
            </div>
            <button type="button" onClick={handleLike} className="flex items-center gap-1">
              <Heart size={14} />
              {renderCount(question.likeCount)}
            </button>
          </div>
        </div>
      </div>
      {reply && <PersonalQuestionReply artwork={artwork} reply={reply} />}
      {loginModal}
    </article>
  );
}

export function PersonalArtworkDetailPage() {
  const navigate = useNavigate();
  const { personalArtworkId: idParam } = useParams<{ personalArtworkId: string }>();
  const personalArtworkId = Number(idParam ?? 0);
  const [activeTab, setActiveTab] = useState<'intro' | 'guestbook'>('intro');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('review');
  const [isArtistView, setIsArtistView] = useState(false);
  const [replyFeeling, setReplyFeeling] = useState<PersonalArtworkFeelingResponseDataDto | null>(
    null,
  );
  const [replyQuestion, setReplyQuestion] = useState<PersonalArtworkQuestionResponseDataDto | null>(
    null,
  );

  const { data: artwork, isPending, isError } = usePersonalArtwork(personalArtworkId);
  const { data: feelings } = usePersonalArtworkFeelings(personalArtworkId);
  const { data: questions } = usePersonalArtworkQuestions(personalArtworkId);
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  const feelingPolicy = usePersonalFeelingPolicy(undefined, artwork);
  const questionPolicy = usePersonalQuestionPolicy(undefined, artwork);
  const createFeeling = useCreatePersonalArtworkFeeling(personalArtworkId);
  const createQuestion = useCreatePersonalArtworkQuestion(personalArtworkId);
  const createFeelingReply = useCreatePersonalArtworkFeelingReply(
    personalArtworkId,
    replyFeeling?.personalFeelingId ?? 0,
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

  const heroImages = formatImageUrls(artwork.images);
  const displayHeroImages = heroImages.length > 0 ? heroImages : [FALLBACK_POSTER_IMAGE];
  const feelingItems = feelings?.feelings;
  const questionItems = questions?.questions;

  const handleSend = ({ content, isPrivate }: { content: string; isPrivate: boolean }) => {
    if (!content) return;

    if (replyFeeling) {
      if (!hasPermission(feelingPolicy, 'reply.create')) {
        openLoginModal();
        return;
      }
      createFeelingReply.mutate(content, { onSuccess: () => setReplyFeeling(null) });
      return;
    }

    if (replyQuestion) {
      if (!hasPermission(questionPolicy, 'reply.create')) {
        openLoginModal();
        return;
      }
      createQuestionReply.mutate(content, { onSuccess: () => setReplyQuestion(null) });
      return;
    }

    if (activeSubTab === 'question') {
      if (!hasPermission(questionPolicy, 'create')) {
        openLoginModal();
        return;
      }
      createQuestion.mutate({ content, isPublic: !isPrivate });
      return;
    }

    if (!hasPermission(feelingPolicy, 'create')) {
      openLoginModal();
      return;
    }
    createFeeling.mutate(content);
  };

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md bg-page">
      <HeroSlider images={displayHeroImages} onBack={() => navigate(-1)} />

      <section className="bg-page px-5 pb-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="typo-body-2xl-bold text-main">{artwork.artworkName}</h1>
            <p className="typo-body-sm-regular text-main">{artwork.type}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 typo-body-xs-regular text-sub600">
          <span>{artwork.productionYear}</span>
          <span>{artwork.materialMedia}</span>
          {artwork.size && <span>{artwork.size}</span>}
        </div>
      </section>

      <div className="flex border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab('intro')}
          className={cn('h-11 flex-1', activeTab === 'intro' ? 'text-main' : 'text-faint')}
        >
          소개
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guestbook')}
          className={cn('h-11 flex-1', activeTab === 'guestbook' ? 'text-main' : 'text-faint')}
        >
          방명록
        </button>
      </div>

      {activeTab === 'intro' ? (
        <div className="pb-24">
          {artwork.content && (
            <section className="px-5 py-6">
              <h2 className="typo-body-xl-bold mb-3 text-main">작품소개</h2>
              <p className="typo-body-sm-regular whitespace-pre-line text-main">
                {artwork.content}
              </p>
            </section>
          )}
          {artwork.images.length > 1 && (
            <section className="bg-box200 px-5 py-5">
              <h2 className="typo-body-xl-bold mb-3 text-main">작업과정</h2>
              <div className="grid grid-cols-3 gap-2">
                {artwork.images.slice(1).map((image) => (
                  <img
                    key={image.imageUrl}
                    src={image.imageUrl}
                    alt=""
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </section>
          )}
          {artwork.point && (
            <section className="px-5 py-5">
              <h2 className="typo-body-xl-bold mb-3 text-main">감상 포인트</h2>
              <p className="typo-body-sm-regular whitespace-pre-line text-main">{artwork.point}</p>
            </section>
          )}
        </div>
      ) : (
        <div className="pb-24">
          <div className="flex bg-bt-gray">
            <button type="button" onClick={() => setActiveSubTab('review')} className="flex-1 py-2">
              감상 {feelingItems?.length}
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('question')}
              className="flex-1 py-2"
            >
              질문 {questionItems?.length}
            </button>
          </div>
          {activeSubTab === 'review' ? (
            <div className="px-5">
              {feelingItems?.map((feeling) => (
                <PersonalReviewCard
                  key={feeling.personalFeelingId}
                  feeling={feeling}
                  artwork={artwork}
                  isReplyTarget={replyFeeling?.personalFeelingId === feeling.personalFeelingId}
                  onReply={() => setReplyFeeling((prev) => (prev ? null : feeling))}
                />
              ))}
            </div>
          ) : (
            <div className="px-5">
              <div className="flex justify-end py-3">
                <button
                  type="button"
                  onClick={() => setIsArtistView((prev) => !prev)}
                  className="typo-body-xs-regular rounded-full border border-line px-2.5 py-1 text-sub600"
                >
                  {isArtistView ? '작가 시점' : '일반인 시점'}
                </button>
              </div>
              {questionItems?.map((question) => (
                <PersonalQuestionCard
                  key={question.personalQuestionId}
                  question={question}
                  artwork={artwork}
                  isArtistView={isArtistView}
                  isReplyTarget={replyQuestion?.personalQuestionId === question.personalQuestionId}
                  onReply={() => setReplyQuestion((prev) => (prev ? null : question))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'guestbook' && (
        <BottomCommentBar
          showPrivateOption={
            !replyFeeling && !replyQuestion && activeSubTab === 'question' && !isArtistView
          }
          replyingTo={replyFeeling ? '감상' : replyQuestion ? '질문' : undefined}
          onCancelReply={() => {
            setReplyFeeling(null);
            setReplyQuestion(null);
          }}
          isSubmitting={
            createFeeling.isPending ||
            createQuestion.isPending ||
            createFeelingReply.isPending ||
            createQuestionReply.isPending
          }
          onSubmit={handleSend}
        />
      )}
      {loginModal}
    </div>
  );
}

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
  useTogglePersonalArtworkLike,
  useTogglePersonalArtworkQuestionLike,
  useTogglePersonalArtworkQuestionReplyLike,
} from '@/hooks/queries/usePersonalArtwork';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import {
  usePersonalArtworkPolicy,
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
    <div className="size-7 shrink-0 overflow-hidden rounded-full border border-line bg-box">
      <img
        src={src || FALLBACK_PROFILE_IMAGE}
        alt=""
        className="size-full object-cover"
        onError={(event) => {
          event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
        }}
      />
    </div>
  );
}

/* 감상·질문 카드 하단의 좋아요 버튼입니다. */
function LikeButton({
  liked,
  count,
  onClick,
}: {
  liked?: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1 text-hint hover:text-main"
    >
      <Heart
        size={14}
        className={cn('transition-colors', liked ? 'fill-heart text-heart' : 'fill-none text-hint')}
      />
      {renderCount(count)}
    </button>
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
    <div className="-mx-5 border-b border-line py-3 pr-5 pl-14">
      <div className="flex w-full items-start justify-start gap-1.5">
        <ProfileImage />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {reply.nickname && (
              <span className="typo-body-sm-bold text-main">{reply.nickname}</span>
            )}
            <span className="typo-body-xs-regular text-faint">{reply.createdAt}</span>
          </div>
          <p className="typo-body-xs-regular wrap-break-word whitespace-pre-line text-sub600">
            {reply.content}
          </p>
          <div className="typo-body-xs-regular mt-3 flex w-full items-center justify-between text-faint">
            <div className="flex items-center gap-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={() => deleteReply.mutate(reply.personalFeelingReplyId)}
                  className="cursor-pointer hover:text-main"
                >
                  삭제
                </button>
              )}
            </div>
            <LikeButton liked={reply.isLiked} count={reply.likeCount} onClick={handleLike} />
          </div>
        </div>
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
    <div className="-mx-5 border-b border-line bg-box100/40 py-3 pr-5 pl-14">
      <div className="flex w-full items-start justify-start gap-1.5">
        <ProfileImage />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="typo-body-sm-bold text-main">{reply.nickname || '작가 답변'}</span>
            <span className="typo-body-xs-regular text-faint">{reply.createdAt}</span>
          </div>
          <p className="typo-body-xs-regular wrap-break-word whitespace-pre-line text-sub600">
            {reply.content}
          </p>
          <div className="typo-body-xs-regular mt-3 flex w-full items-center justify-between text-faint">
            <div className="flex items-center gap-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={() => deleteReply.mutate(reply.personalQuestionReplyId)}
                  className="cursor-pointer hover:text-main"
                >
                  삭제
                </button>
              )}
            </div>
            <LikeButton liked={reply.isLiked} count={reply.likeCount} onClick={handleLike} />
          </div>
        </div>
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
    <article
      className={cn(
        'w-full transition-colors',
        /* 답글 대상으로 선택되면 어떤 감상에 답글을 다는지 드러나게 강조합니다. */
        isReplyTarget && '-mx-5 w-[calc(100%+2.5rem)] bg-box100 px-5',
      )}
    >
      <div className="-mx-5 border-b border-line px-5 py-3">
        <div className="flex w-full items-start justify-start gap-1.5">
          <ProfileImage src={feeling.profileImageUrl} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {feeling.nickname && (
                <span className="typo-body-sm-bold text-main">{feeling.nickname}</span>
              )}
              <span className="typo-body-xs-regular text-faint">{feeling.createdAt}</span>
            </div>
            <p className="typo-body-xs-regular wrap-break-word whitespace-pre-line text-sub600">
              {feeling.content}
            </p>
            <div className="typo-body-xs-regular mt-3 flex w-full items-center justify-between text-faint">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReply}
                  className="cursor-pointer hover:text-main"
                >
                  답글달기
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => deleteFeeling.mutate(feeling.personalFeelingId)}
                    className="cursor-pointer hover:text-main"
                  >
                    삭제
                  </button>
                )}
              </div>
              <LikeButton liked={feeling.isLiked} count={feeling.likeCount} onClick={handleLike} />
            </div>
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
      <article className="w-full">
        <div className="-mx-5 flex flex-col gap-1.5 border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <Lock size={16} className="shrink-0 text-main" strokeWidth={3} />
            <span className="typo-body-sm-bold text-main">비공개 질문입니다.</span>
          </div>
          <div className="typo-body-xs-regular flex items-center gap-2 pl-6 text-faint">
            <span>{reply ? '답변완료' : '답변대기'}</span>
            <span>{question.createdAt}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'w-full transition-colors',
        /* 답변 대상으로 선택되면 어떤 질문에 답하는지 드러나게 강조합니다. */
        isReplyTarget && '-mx-5 w-[calc(100%+2.5rem)] bg-box100 px-5',
      )}
    >
      <div className="-mx-5 border-b border-line px-5 py-3">
        <div className="flex w-full items-start justify-start gap-1.5">
          <ProfileImage src={question.profileImageUrl} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {question.nickname && (
                  <span className="typo-body-sm-bold text-main">{question.nickname}</span>
                )}
                <span className="typo-body-xs-regular text-faint">{question.createdAt}</span>
              </div>
              {!question.isPublic && (
                <Lock size={16} className="shrink-0 text-main" strokeWidth={3} />
              )}
            </div>
            <p className="typo-body-xs-regular wrap-break-word whitespace-pre-line text-sub600">
              {question.content}
            </p>
            <div className="typo-body-xs-regular mt-3 flex w-full items-center justify-between text-faint">
              <div className="flex items-center gap-2">
                {isArtistView && canCreateReply && !reply && (
                  <button
                    type="button"
                    onClick={handleReply}
                    className="cursor-pointer hover:text-main"
                  >
                    답글달기
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => deleteQuestion.mutate(question.personalQuestionId)}
                    className="cursor-pointer hover:text-main"
                  >
                    삭제
                  </button>
                )}
              </div>
              <LikeButton
                liked={question.isLiked}
                count={question.likeCount}
                onClick={handleLike}
              />
            </div>
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
  const artworkPolicy = usePersonalArtworkPolicy(artwork);
  const liked = artwork?.isLiked ?? false;
  const canToggleLike = hasPermission(artworkPolicy, liked ? 'unlike' : 'like');
  const toggleLike = useTogglePersonalArtworkLike(personalArtworkId);
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

  /* 히어로는 작품 이미지만, 작업과정 섹션은 WORK_PROCESS 이미지만 사용합니다. */
  const artworkImages = artwork.images.filter((image) => image.imageType !== 'WORK_PROCESS');
  const processImages = artwork.images.filter((image) => image.imageType === 'WORK_PROCESS');
  const heroImages = formatImageUrls(artworkImages);
  const displayHeroImages = heroImages.length > 0 ? heroImages : [FALLBACK_POSTER_IMAGE];
  const feelingItems = feelings?.feelings;
  const questionItems = questions?.questions;

  const handleLike = () => {
    if (toggleLike.isPending) return;
    if (!canToggleLike) {
      openLoginModal();
      return;
    }

    toggleLike.mutate(liked);
  };

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
      {/* 히어로 이미지 */}
      <HeroSlider images={displayHeroImages} onBack={() => navigate(-1)} />

      {/* 작품 메타 (제목, 작가, 제작 정보) */}
      <section className="bg-page px-5 pt-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="typo-body-2xl-bold text-main">{artwork.artworkName}</h1>
          <div className="flex shrink-0 flex-col items-center">
            <button
              type="button"
              aria-pressed={liked}
              aria-label={`좋아요 ${artwork.likeCount ?? 0}개`}
              onClick={handleLike}
              className="cursor-pointer transition-transform active:scale-95"
            >
              <Heart
                size={24}
                strokeWidth={1.5}
                className={cn(
                  'transition-colors duration-200',
                  liked ? 'fill-heart text-heart' : 'fill-none text-main',
                )}
              />
            </button>
            <span className="typo-body-xs-regular mt-1 text-main">{artwork.likeCount ?? 0}</span>
          </div>
        </div>
        {artwork.nickname && (
          <p className="typo-body-sm-regular -mt-1.5 text-main">{artwork.nickname}</p>
        )}

        <dl className="mt-4 flex flex-col gap-2">
          {[
            { label: '제작연도', value: artwork.productionYear },
            { label: '재료/매체', value: artwork.materialMedia },
            { label: '규격', value: artwork.size },
          ]
            .filter((item) => Boolean(item.value))
            .map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <dt className="typo-body-xs-regular w-16 shrink-0 text-faint">{item.label}</dt>
                <dd className="typo-body-xs-regular min-w-0 flex-1 text-sub600">{item.value}</dd>
              </div>
            ))}
        </dl>
      </section>

      {/* 소개 / 방명록 탭 */}
      <nav className="sticky top-0 z-10 flex gap-5.5 border-b-2 border-line-soft bg-page px-5">
        {(
          [
            { key: 'intro', label: '소개' },
            { key: 'guestbook', label: '방명록' },
          ] as const
        ).map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'typo-body-sm-regular relative cursor-pointer py-4 whitespace-nowrap transition-all duration-150',
                isActive ? 'font-bold text-main' : 'text-faint',
              )}
            >
              {tab.label}
              {isActive && <span className="absolute -bottom-0.5 right-0 left-0 h-0.5 bg-main" />}
            </button>
          );
        })}
      </nav>

      {activeTab === 'intro' ? (
        <div className="pb-bottom-bar-offset">
          {artwork.content && (
            <section className="px-5 pt-7 pb-6">
              <h2 className="typo-body-xl-bold mb-3 text-main">작품소개</h2>
              <p className="typo-body-sm-regular whitespace-pre-line text-main leading-relaxed">
                {artwork.content}
              </p>
            </section>
          )}
          {processImages.length > 0 && (
            <section className="bg-box200 px-5 pt-5 pb-5">
              <h2 className="typo-body-xl-bold mb-3 text-main">작업과정</h2>
              <div className="grid grid-cols-3 gap-2">
                {processImages.map((image) => (
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
            <section className="px-5 pt-5 pb-5">
              <h2 className="typo-body-xl-bold mb-3 text-main">감상 포인트</h2>
              <p className="typo-body-sm-regular whitespace-pre-line text-main leading-relaxed">
                {artwork.point}
              </p>
            </section>
          )}
        </div>
      ) : (
        <div className="pb-bottom-bar-offset">
          {/* 서브탭: 감상 / 질문 */}
          <div className="flex bg-bt-gray">
            {(
              [
                { key: 'review', label: '감상', count: feelingItems?.length ?? 0 },
                { key: 'question', label: '질문', count: questionItems?.length ?? 0 },
              ] as const
            ).map((tab) => {
              const isActive = activeSubTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveSubTab(tab.key)}
                  className="relative flex flex-1 cursor-pointer flex-col items-center py-1.5 transition-colors duration-150"
                >
                  <span
                    className={cn('typo-body-xs-regular', isActive ? 'text-main' : 'text-faint')}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={cn('typo-body-xs-regular', isActive ? 'text-main' : 'text-faint')}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <span className="absolute right-0 bottom-0 left-0 h-[1.5px] bg-main" />
                  )}
                </button>
              );
            })}
          </div>

          {activeSubTab === 'review' ? (
            <div className="px-5 pt-2">
              <div className="py-4">
                <h2 className="typo-body-xl-bold text-main">감상 후기</h2>
              </div>
              <div className="flex flex-col">
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
              {!feelingItems?.length && (
                <p className="typo-body-sm-regular py-10 text-center text-faint">
                  아직 감상 후기가 없습니다.
                </p>
              )}
            </div>
          ) : (
            <div className="px-5 pt-2">
              <div className="flex items-center justify-between py-4">
                <h2 className="typo-body-xl-bold text-main">질문하기</h2>
                <button
                  type="button"
                  onClick={() => setIsArtistView((prev) => !prev)}
                  className="typo-body-xs-regular cursor-pointer rounded-full border border-line px-2.5 py-1 text-sub600 hover:text-main"
                >
                  {isArtistView ? '작가 시점' : '일반인 시점'}
                </button>
              </div>
              <div className="flex flex-col">
                {questionItems?.map((question) => (
                  <PersonalQuestionCard
                    key={question.personalQuestionId}
                    question={question}
                    artwork={artwork}
                    isArtistView={isArtistView}
                    isReplyTarget={
                      replyQuestion?.personalQuestionId === question.personalQuestionId
                    }
                    onReply={() => setReplyQuestion((prev) => (prev ? null : question))}
                  />
                ))}
              </div>
              {!questionItems?.length && (
                <p className="typo-body-sm-regular py-10 text-center text-faint">
                  아직 질문이 없습니다.
                </p>
              )}
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

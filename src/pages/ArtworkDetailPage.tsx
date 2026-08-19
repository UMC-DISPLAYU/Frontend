import { useCallback, useEffect, useRef, useState } from 'react';

import { useLocation, useParams } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import type { ArtworkDetailTabKey } from '@/components/artworkdetailpage/ArtworkTabNav';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { BottomCommentBar, ErrorView, LoadingView } from '@/components/common';
import { BottomFixedBar } from '@/components/displaydetailpage';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { BackButton } from '@/components/ui/BackButton';
import { useArtworkDetail } from '@/hooks/queries/useArtworkDetail';
import {
  useArtworkFeelings,
  useCreateArtworkFeeling,
  useCreateArtworkFeelingReply,
} from '@/hooks/queries/useArtworkFeelings';
import {
  useArtworkQuestions,
  useCreateArtworkQuestion,
  useCreateArtworkQuestionReply,
  useDeleteArtworkQuestion,
  useDeleteArtworkQuestionReply,
} from '@/hooks/queries/useArtworkQuestions';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useFeelingPolicy, useFeelingReplyPolicy, useQuestionPolicy } from '@/hooks/usePolicy';
import type { ArtworkDetail, GuestbookQuestion } from '@/types/exhibition';
import { getExhibitionArtistName } from '@/utils/artist';
import { parseServerDate } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

export function ArtworkDetailPage() {
  const flowBack = useFlowBack();
  const location = useLocation();
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam ?? 0);
  const tabRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<ArtworkDetailTabKey>(
    (location.state as { initialTab?: ArtworkDetailTabKey } | null)?.initialTab ?? 'intro',
  );

  useEffect(() => {
    if (location.state?.initialTab) {
      const timer = setTimeout(() => {
        tabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const { data: userMe } = useUserMe();
  const myUserId = userMe?.id;

  const { data: detail, isPending, isError } = useArtworkDetail(artworkId);
  const {
    data: feelingsData,
    hasNextPage: hasMoreFeelings,
    fetchNextPage: fetchMoreFeelings,
    isFetchingNextPage: isFetchingMoreFeelings,
  } = useArtworkFeelings(artworkId);
  const {
    data: questionsData,
    hasNextPage: hasMoreQuestions,
    fetchNextPage: fetchMoreQuestions,
    isFetchingNextPage: isFetchingMoreQuestions,
  } = useArtworkQuestions(artworkId);

  /* 작가 전용 권한 판단(팀원 여부 등)에 필요해 전시 상세도 함께 조회합니다. */
  const { data: display } = useDisplayDetail(detail?.exhibitionInfo?.displayId ?? 0);

  const createFeeling = useCreateArtworkFeeling();
  const createQuestion = useCreateArtworkQuestion();
  const deleteQuestion = useDeleteArtworkQuestion();
  const deleteQuestionReply = useDeleteArtworkQuestionReply();
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  /* 감상 답글 대상 — 라운지/전시상세와 동일한 패턴(공용 BottomCommentBar가 씀) */
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
  const createFeelingReply = useCreateArtworkFeelingReply(
    artworkId,
    feelingReplyTarget?.commentId ?? 0,
  );

  /* 질문 답변(작가 전용) 대상 — 기존 그대로 유지 */
  const [questionReplyTarget, setQuestionReplyTarget] = useState<GuestbookQuestion | null>(null);
  /* 질문 탭 진입 시 입력창을 바로 띄우지 않고, "+" 클릭 시에만 새 질문 작성 모드로 엽니다. */
  const [isComposingQuestion, setIsComposingQuestion] = useState(false);
  const createQuestionReply = useCreateArtworkQuestionReply();
  const policyDisplay = (display ?? {
    ownerUserId: 0,
    teamMembers: [],
  }) as DisplayDetailDto;
  const feelingPolicy = useFeelingPolicy(policyDisplay, undefined);
  const feelingReplyPolicy = useFeelingReplyPolicy(policyDisplay);
  const fallbackQuestion: GuestbookQuestion = {
    questionId: 0,
    content: '',
    isPublic: true,
    accessible: true,
    canReply: false,
    likeCount: null,
    createdAt: '',
    user: { userId: 0, nickname: '' },
    reply: null,
  };
  const questionPolicy = useQuestionPolicy(
    questionReplyTarget ?? fallbackQuestion,
    policyDisplay,
    detail,
  );

  const feelings = (feelingsData?.pages.flatMap((page) => page.feelings) ?? []).filter(
    // 답글 없는 삭제된 감상은 목록에서 완전히 제외 (답글이 있으면 "삭제된 글입니다"로 표시)
    (feeling) => !(feeling.isDeleted && feeling.replyCount === 0),
  );

  /*
   * 질문 응답을 방명록 화면이 쓰는 형태로 맞춥니다.
   * 스웨거 응답에는 프로필 이미지가 없어 화면 기본값을 사용합니다.
   * 새로 등록한 질문이 "+" 버튼과 같은 위치(맨 위)에 보이도록 최신순으로 정렬합니다.
   */
  const questions: GuestbookQuestion[] = (
    questionsData?.pages.flatMap((page) => page.questions) ?? []
  )
    .slice()
    .sort((a, b) => parseServerDate(b.createdAt).getTime() - parseServerDate(a.createdAt).getTime())
    .map((question) => ({
      questionId: question.questionId,
      content: question.content,
      isPublic: question.isPublic ?? true,
      accessible: question.accessible,
      canReply: question.canReply,
      likeCount: question.likeCount,
      createdAt: question.createdAt,
      images: question.images,
      user: question.user
        ? {
            userId: question.user.userId ?? 0,
            nickname: question.user.nickname ?? '',
          }
        : null,
      reply: question.reply
        ? {
            questionReplyId: question.reply.questionReplyId,
            queReplyId: question.reply.queReplyId,
            questionId: question.reply.questionId,
            content: question.reply.content,
            createdAt: question.reply.createdAt,
            userId: question.reply.userId ?? question.reply.creatorId,
            nickname: question.reply.nickname ?? question.reply.creatorName,
            creatorId: question.reply.creatorId,
            creatorName: question.reply.creatorName,
            images: question.reply.images,
          }
        : null,
      /* 본인 질문이면 시점과 무관하게 수정·삭제할 수 있습니다. */
      isMyQuestion: Boolean(myUserId) && question.user?.userId === myUserId,
    }));

  /*
   * 답변 대상이 있으면 답변으로, 없으면 새 질문으로 등록합니다.
   * 등록 카드가 요청 실패 시 작성 내용을 보존할 수 있도록 mutateAsync로 실패를 그대로 전파합니다.
   */
  const handleSendQuestion = async ({
    content,
    isPrivate,
    images,
  }: {
    content: string;
    isPrivate: boolean;
    images?: { imageUrl: string; width?: number; height?: number }[];
  }) => {
    if (!content) return;

    if (questionReplyTarget) {
      /* 답변 등록 가능 여부는 서버가 계산해서 canReply로 내려줍니다. */
      if (!questionReplyTarget.canReply) {
        openLoginModal();
        return;
      }

      const targetQuestionId = questionReplyTarget.questionId;
      await createQuestionReply.mutateAsync({
        artworkId,
        questionId: targetQuestionId,
        body: { content, images },
      });
      /*
       * 이미지 업로드로 대기하는 동안 사용자가 다른 질문의 답변대기로 전환했을 수 있어,
       * 완료 시점의 최신 상태를 확인해 같은 질문을 향하고 있을 때만 선택을 해제합니다.
       */
      setQuestionReplyTarget((current) =>
        current?.questionId === targetQuestionId ? null : current,
      );
      return;
    }

    if (!hasPermission(questionPolicy, 'create')) {
      openLoginModal();
      return;
    }

    await createQuestion.mutateAsync({
      artworkId,
      body: { content, isPublic: !isPrivate, images },
    });
    setIsComposingQuestion(false);
  };

  if (isPending) {
    return <LoadingView message="작품 정보를 불러오는 중..." />;
  }

  if (isError || !detail) {
    return (
      <ErrorView
        title="작품 정보를 찾을 수 없습니다"
        message="요청하신 작품 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => flowBack()}
      />
    );
  }

  const artistDisplayName = getExhibitionArtistName(
    detail.artistName,
    detail.artistUserId,
    display?.teamMembers,
  );

  /* 화면이 쓰는 ArtworkDetail 형태로 변환합니다. */
  const artwork: ArtworkDetail = {
    artworkId: detail.artworkId,
    artworkName: detail.artworkName,
    content: detail.content,
    type: detail.type,
    productionYear: detail.productionYear,
    materialMedia: detail.materialMedia,
    size: detail.size,
    point: detail.point,
    images: detail.images,
    artist: artistDisplayName,
    exhibitionId: String(detail.exhibitionInfo?.displayId ?? ''),
    exhibitionTitle: detail.exhibitionInfo?.exhibitionTitle ?? '',
    exhibitionSubtitle: detail.exhibitionInfo?.exhibitionSubtitle ?? '',
    exhibitionOrganizer: detail.exhibitionInfo?.exhibitionOrganizer ?? '',
    exhibitionPeriod: detail.exhibitionInfo?.exhibitionPeriod ?? '',
    exhibitionThumbnail: detail.exhibitionInfo?.exhibitionThumbnailUrl ?? '',
    bookmarkCount: detail.likeCount ?? 0,
    isLiked: detail.isLiked ?? false,
    isArchived: detail.isArchived ?? false,
  };

  /* 히어로는 작품 이미지만 사용합니다(작업과정 이미지는 소개 탭에서 별도로 씁니다). 썸네일로 지정된 이미지를 앞에 두고, 없으면 등록 순서대로 보여줍니다. */
  const artworkImages = (detail.images ?? []).filter((image) => image.imageType !== 'WORK_PROCESS');
  const heroImages = artworkImages
    .map((image) => image.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const thumbnailUrl = artworkImages.find((image) => image.isThumbnail)?.imageUrl;
  const orderedHeroImages = thumbnailUrl
    ? [thumbnailUrl, ...heroImages.filter((imageUrl) => imageUrl !== thumbnailUrl)]
    : heroImages;

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative">
      <div className="fixed top-4 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pointer-events-none">
        <BackButton
          id="artwork-back-btn"
          onClick={() => flowBack()}
          className="pointer-events-auto"
        />
      </div>
      {/* 히어로 이미지 */}
      <HeroSlider images={orderedHeroImages} />

      {/* 작품 메타 (제목, 작가, 소속전시, 저장버튼) */}
      <ArtworkMeta artwork={artwork} />

      {/* 소개 / 방명록 / 질문 탭 */}
      <div ref={tabRef}>
        <ArtworkTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && (
        <ArtworkIntroTab
          artwork={artwork}
          artistUserId={detail.artistUserId}
          coAuthors={detail.coAuthors}
        />
      )}
      {(activeTab === 'review' || activeTab === 'question') && (
        <ArtworkGuestbookTab
          feelings={feelings}
          hasMoreFeelings={hasMoreFeelings}
          onLoadMoreFeelings={fetchMoreFeelings}
          isLoadingMoreFeelings={isFetchingMoreFeelings}
          questions={questions}
          hasMoreQuestions={hasMoreQuestions}
          onLoadMoreQuestions={fetchMoreQuestions}
          isLoadingMoreQuestions={isFetchingMoreQuestions}
          artworkId={artworkId}
          myUserId={myUserId}
          artwork={detail}
          display={policyDisplay}
          activeTab={activeTab}
          activeReplyId={activeReplyId}
          onFeelingReplyClick={handleFeelingReplyClick}
          replyTargetQuestionId={questionReplyTarget?.questionId ?? null}
          onQuestionReplyTargetChange={(question) => {
            setQuestionReplyTarget(question);
            if (question) setIsComposingQuestion(false);
          }}
          onAddQuestionClick={() => {
            setQuestionReplyTarget(null);
            setIsComposingQuestion(true);
          }}
          isComposingQuestion={isComposingQuestion}
          onCloseComposeQuestion={() => setIsComposingQuestion(false)}
          onSubmitQuestion={handleSendQuestion}
          isSubmittingQuestion={createQuestion.isPending || createQuestionReply.isPending}
          onDeleteQuestion={(questionId) => deleteQuestion.mutate({ artworkId, questionId })}
          onDeleteReply={(questionId, questionReplyId) =>
            deleteQuestionReply.mutate({ artworkId, questionId, questionReplyId })
          }
        />
      )}

      {activeTab === 'intro' ? (
        <BottomFixedBar
          button={
            <ArtworkSaveButton
              className="w-full"
              artworkId={artworkId}
              saved={detail.isArchived ?? false}
            />
          }
          shareTitle={artwork.artworkName}
          shareImageUrl={orderedHeroImages[0]}
        />
      ) : activeTab === 'review' ? (
        <BottomCommentBar
          placeholder="글을 입력하세요."
          imageDomain="artwork-feeling"
          isSubmitting={feelingReplyTarget ? createFeelingReply.isPending : createFeeling.isPending}
          replyingTo={feelingReplyTarget?.author}
          onCancelReply={clearFeelingReplyTarget}
          onSubmit={({ content, images }) => {
            const finalContent = content.trim() || '.';
            const formattedImages = images.map((img, index) => ({
              imageUrl: img.imageUrl,
              width: Math.round(img.width) || 0,
              height: Math.round(img.height) || 0,
              sortOrder: index + 1,
            }));

            if (feelingReplyTarget) {
              if (!hasPermission(feelingReplyPolicy, 'reply.create')) {
                openLoginModal();
                return;
              }
              createFeelingReply.mutate(
                { content: finalContent, images: formattedImages },
                { onSuccess: clearFeelingReplyTarget },
              );
              return;
            }

            if (!hasPermission(feelingPolicy, 'create')) {
              openLoginModal();
              return;
            }

            createFeeling.mutate({
              artworkId,
              body: { content: finalContent, images: formattedImages },
            });
          }}
        />
      ) : null}
      {loginModal}
    </div>
  );
}

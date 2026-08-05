import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { BottomCommentBar, CommentInputBar, ErrorView, LoadingView } from '@/components/common';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
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
} from '@/hooks/queries/useArtworkQuestions';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import type {
  ArtworkDetail,
  ArtworkGuestbookTab as ArtworkGuestbookSubTabType,
  GuestbookQuestion,
} from '@/types/exhibition';

export function ArtworkDetailPage() {
  const navigate = useNavigate();
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam ?? 0);

  const [activeTab, setActiveTab] = useState<'intro' | 'guestbook'>('intro');
  const [activeSubTab, setActiveSubTab] = useState<ArtworkGuestbookSubTabType>('review');
  const [isArtistView, setIsArtistView] = useState(false);

  const { data: userMe } = useUserMe();
  const myUserId = userMe?.id;

  const { data: detail, isPending, isError } = useArtworkDetail(artworkId);
  const {
    data: feelingsData,
    hasNextPage: hasMoreFeelings,
    fetchNextPage: fetchMoreFeelings,
    isFetchingNextPage: isFetchingMoreFeelings,
  } = useArtworkFeelings(artworkId);
  const { data: questionsData } = useArtworkQuestions(artworkId);

  /*
   * 스웨거 ExhibitionInfoResponse에는 전시 포스터가 없어
   * displayId로 전시 상세를 조회해 썸네일을 가져옵니다.
   */
  const { data: display } = useDisplayDetail(detail?.exhibitionInfo?.displayId ?? 0);

  const createFeeling = useCreateArtworkFeeling();
  const createQuestion = useCreateArtworkQuestion();

  /* 감상 답글 대상 — 라운지/전시상세와 동일한 패턴(공용 CommentInputBar가 씀) */
  const [feelingReplyTarget, setFeelingReplyTarget] = useState<{
    commentId: number;
    author: string;
  } | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const clearFeelingReplyTarget = () => {
    setFeelingReplyTarget(null);
    setActiveReplyId(null);
  };
  const createFeelingReply = useCreateArtworkFeelingReply(
    artworkId,
    feelingReplyTarget?.commentId ?? 0,
  );

  /* 질문 답변(작가 전용) 대상 — 기존 그대로 유지 */
  const [questionReplyTarget, setQuestionReplyTarget] = useState<GuestbookQuestion | null>(null);
  const createQuestionReply = useCreateArtworkQuestionReply();

  const feelings = feelingsData?.pages.flatMap((page) => page.feelings) ?? [];

  /*
   * 질문 응답을 방명록 화면이 쓰는 형태로 맞춥니다.
   * 스웨거 응답에는 프로필 이미지와 좋아요 정보가 없어 화면 기본값을 사용합니다.
   */
  const questions: GuestbookQuestion[] = (questionsData?.questions ?? []).map((question) => ({
    questionId: question.questionId,
    content: question.content,
    isPublic: question.isPublic ?? true,
    createdAt: question.createdAt,
    user: {
      userId: question.user?.userId ?? 0,
      nickname: question.user?.nickname ?? '',
    },
    reply: question.reply
      ? { content: question.reply.content, createdAt: question.createdAt }
      : null,
    /* 본인 질문이면 시점과 무관하게 수정·삭제할 수 있습니다. */
    isMyQuestion: Boolean(myUserId) && question.user?.userId === myUserId,
  }));

  /* 답변 대상이 있으면 답변으로, 없으면 새 질문으로 등록합니다. */
  const handleSendQuestion = ({ content, isPrivate }: { content: string; isPrivate: boolean }) => {
    if (!content) return;

    if (questionReplyTarget) {
      createQuestionReply.mutate(
        { artworkId, questionId: questionReplyTarget.questionId, body: { content } },
        { onSuccess: () => setQuestionReplyTarget(null) },
      );
      return;
    }

    createQuestion.mutate({ artworkId, body: { content, isPublic: !isPrivate } });
  };

  if (isPending) {
    return <LoadingView message="작품 정보를 불러오는 중..." />;
  }

  if (isError || !detail) {
    return (
      <ErrorView
        title="작품 정보를 찾을 수 없습니다"
        message="요청하신 작품 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  const source = display as (typeof display & { posterImageUrl?: string }) | undefined;
  const displayPoster = source?.posterImageUrl ?? source?.images?.[0]?.imageUrl ?? '';

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
    artist: detail.artistName,
    exhibitionId: String(detail.exhibitionInfo?.displayId ?? ''),
    exhibitionTitle: detail.exhibitionInfo?.exhibitionTitle ?? '',
    exhibitionOrganizer: detail.exhibitionInfo?.exhibitionLocation ?? '',
    exhibitionPeriod: detail.exhibitionInfo?.exhibitionPeriod ?? '',
    exhibitionThumbnail: displayPoster,
    bookmarkCount: detail.likeCount ?? 0,
    isBookmarked: detail.isLiked ?? false,
  };

  /* 썸네일로 지정된 이미지를 앞에 두고, 없으면 등록 순서대로 보여줍니다. */
  const heroImages = (detail.images ?? [])
    .map((image) => image.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
  const thumbnailUrl = detail.images?.find((image) => image.isThumbnail)?.imageUrl;
  const orderedHeroImages = thumbnailUrl
    ? [thumbnailUrl, ...heroImages.filter((imageUrl) => imageUrl !== thumbnailUrl)]
    : heroImages;

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative">
      {/* 히어로 이미지 */}
      <HeroSlider images={orderedHeroImages} onBack={() => navigate(-1)} />

      {/* 작품 메타 (제목, 작가, 소속전시, 저장버튼) */}
      <ArtworkMeta artwork={artwork} />

      {/* 소개 / 방명록 탭 */}
      <ArtworkTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && (
        <ArtworkIntroTab artwork={artwork} artistUserId={detail.artistUserId} />
      )}
      {activeTab === 'guestbook' && (
        <ArtworkGuestbookTab
          feelings={feelings}
          hasMoreFeelings={hasMoreFeelings}
          onLoadMoreFeelings={fetchMoreFeelings}
          isLoadingMoreFeelings={isFetchingMoreFeelings}
          questions={questions}
          artworkId={artworkId}
          myUserId={myUserId}
          activeSubTab={activeSubTab}
          onSubTabChange={setActiveSubTab}
          isArtistView={isArtistView}
          onArtistViewChange={setIsArtistView}
          activeReplyId={activeReplyId}
          onFeelingReplyClick={(commentId, author, highlightId) => {
            setFeelingReplyTarget({ commentId, author });
            setActiveReplyId(highlightId);
          }}
          replyTargetQuestionId={questionReplyTarget?.questionId ?? null}
          onQuestionReplyTargetChange={setQuestionReplyTarget}
        />
      )}

      {/* 하단 고정 바: 소개 탭은 저장버튼, 감상 탭은 공용 입력바, 질문 탭은 기존 입력바 */}
      {activeTab === 'intro' ? (
        <BottomFixedBar
          button={
            <ArtworkSaveButton
              className="w-full"
              artworkId={artworkId}
              saved={detail.isSaved ?? false}
            />
          }
        />
      ) : activeSubTab === 'review' ? (
        <CommentInputBar
          replyTarget={feelingReplyTarget}
          onCancelReply={clearFeelingReplyTarget}
          onSubmitComment={(content, imageUrls) =>
            createFeeling.mutateAsync({
              artworkId,
              body: { content, images: imageUrls.map((imageUrl) => ({ imageUrl })) },
            })
          }
          onSubmitReply={(commentId, content) =>
            // 감상 답글 API는 이미지 첨부를 지원하지 않음
            createFeelingReply.mutateAsync(content, { onSuccess: clearFeelingReplyTarget })
          }
          imageUploadDomain="artwork-feeling"
        />
      ) : (
        <BottomCommentBar
          /* 일반인 시점에서만 비공개로 남길 수 있습니다. */
          showPrivateOption={!questionReplyTarget && !isArtistView}
          replyingTo={questionReplyTarget?.user?.nickname}
          onCancelReply={() => setQuestionReplyTarget(null)}
          isSubmitting={createQuestionReply.isPending || createQuestion.isPending}
          onSubmit={handleSendQuestion}
        />
      )}
    </div>
  );
}

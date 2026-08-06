import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { DisplayDetailDto, GetArtworkDetailResponseDataDto } from '@/api/dto';
import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { BottomCommentBar, ErrorView, LoadingView } from '@/components/common';
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
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import {
  useFeelingPolicy,
  useFeelingReplyPolicy,
  useQuestionPolicy,
  useQuestionReplyPolicy,
} from '@/hooks/usePolicy';
import type {
  ArtworkDetail,
  ArtworkGuestbookTab as ArtworkGuestbookSubTabType,
  GuestbookQuestion,
  GuestbookReview,
} from '@/types/exhibition';
import { hasPermission } from '@/utils/hasPermission';

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
  const { data: feelingsData } = useArtworkFeelings(artworkId);
  const { data: questionsData } = useArtworkQuestions(artworkId);

  /*
   * 스웨거 ExhibitionInfoResponse에는 전시 포스터가 없어
   * displayId로 전시 상세를 조회해 썸네일을 가져옵니다.
   */
  const { data: display } = useDisplayDetail(detail?.exhibitionInfo?.displayId ?? 0);

  const createFeeling = useCreateArtworkFeeling();
  const createQuestion = useCreateArtworkQuestion();
  const { loginModal, openLoginModal } = useLoginRequiredModal();

  /* 하단 입력바가 답글 모드일 때 대상 감상/질문. 둘 다 null이면 새 글을 남깁니다. */
  const [replyTarget, setReplyTarget] = useState<GuestbookReview | null>(null);
  const [questionReplyTarget, setQuestionReplyTarget] = useState<GuestbookQuestion | null>(null);

  const createFeelingReply = useCreateArtworkFeelingReply(artworkId, replyTarget?.feelingId ?? 0);
  const createQuestionReply = useCreateArtworkQuestionReply();
  const policyDisplay = (display ?? {
    ownerUserId: 0,
    teamMembers: [],
  }) as DisplayDetailDto;
  const policyArtwork = (detail ?? {
    artistUserId: 0,
    qaHandlers: [],
  }) as GetArtworkDetailResponseDataDto;
  const feelingPolicy = useFeelingPolicy(policyDisplay, undefined);
  const feelingReplyPolicy = useFeelingReplyPolicy(policyDisplay);
  const fallbackQuestion: GuestbookQuestion = {
    questionId: 0,
    content: '',
    isPublic: true,
    createdAt: '',
    user: { userId: 0, nickname: '' },
    reply: null,
  };
  const questionPolicy = useQuestionPolicy(questionReplyTarget ?? fallbackQuestion, policyDisplay);
  const questionReplyPolicy = useQuestionReplyPolicy(
    questionReplyTarget ?? fallbackQuestion,
    policyDisplay,
    policyArtwork,
  );

  /*
   * 감상/질문 응답을 방명록 화면이 쓰는 형태로 맞춥니다.
   * 스웨거 응답에는 프로필 이미지와 좋아요 정보가 없어 화면 기본값을 사용합니다.
   */
  const reviews: GuestbookReview[] = (feelingsData?.feelings ?? []).map((feeling) => ({
    feelingId: feeling.feelingId,
    content: feeling.content,
    createdAt: feeling.createdAt,
    user: {
      userId: feeling.user?.userId ?? feeling.userId ?? 0,
      nickname: feeling.user?.nickname ?? '',
    },
    reply: feeling.reply ? { content: feeling.reply.content, createdAt: feeling.createdAt } : null,
    images: feeling.images?.map((image) => image.imageUrl),
    isMyReview: Boolean(myUserId) && (feeling.user?.userId ?? feeling.userId) === myUserId,
  }));

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
        }
      : null,
    /* 본인 질문이면 시점과 무관하게 수정·삭제할 수 있습니다. */
    isMyQuestion: Boolean(myUserId) && question.user?.userId === myUserId,
  }));

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

  /* 답글 대상이 있으면 답글로, 없으면 탭에 맞춰 감상/질문으로 등록합니다. */
  const handleSendGuestbook = ({ content, isPrivate }: { content: string; isPrivate: boolean }) => {
    if (!content) return;

    if (replyTarget) {
      if (!hasPermission(feelingReplyPolicy, 'reply.create')) {
        openLoginModal();
        return;
      }

      createFeelingReply.mutate(content, { onSuccess: () => setReplyTarget(null) });
      return;
    }

    if (questionReplyTarget) {
      if (!hasPermission(questionReplyPolicy, 'reply.create')) {
        openLoginModal();
        return;
      }

      createQuestionReply.mutate(
        { artworkId, questionId: questionReplyTarget.questionId, body: { content } },
        { onSuccess: () => setQuestionReplyTarget(null) },
      );
      return;
    }

    if (activeSubTab === 'question') {
      if (!hasPermission(questionPolicy, 'create')) {
        openLoginModal();
        return;
      }

      createQuestion.mutate({ artworkId, body: { content, isPublic: !isPrivate } });
      return;
    }

    if (!hasPermission(feelingPolicy, 'create')) {
      openLoginModal();
      return;
    }

    createFeeling.mutate({ artworkId, body: { content } });
  };

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
          reviews={reviews}
          questions={questions}
          artworkId={artworkId}
          artwork={detail}
          display={policyDisplay}
          activeSubTab={activeSubTab}
          onSubTabChange={setActiveSubTab}
          isArtistView={isArtistView}
          onArtistViewChange={setIsArtistView}
          replyTargetFeelingId={replyTarget?.feelingId ?? null}
          onReplyTargetChange={setReplyTarget}
          replyTargetQuestionId={questionReplyTarget?.questionId ?? null}
          onQuestionReplyTargetChange={setQuestionReplyTarget}
        />
      )}

      {/* 하단 고정 바: 소개 탭은 저장버튼, 방명록 탭은 글쓰기 입력 바 */}
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
      ) : (
        <BottomCommentBar
          /* 일반인 시점 질문 탭에서만 비공개로 남길 수 있습니다. */
          showPrivateOption={
            !replyTarget && !questionReplyTarget && activeSubTab === 'question' && !isArtistView
          }
          replyingTo={replyTarget?.user?.nickname ?? questionReplyTarget?.user?.nickname}
          onCancelReply={() => {
            setReplyTarget(null);
            setQuestionReplyTarget(null);
          }}
          isSubmitting={
            createFeelingReply.isPending ||
            createQuestionReply.isPending ||
            createFeeling.isPending ||
            createQuestion.isPending
          }
          onSubmit={handleSendGuestbook}
        />
      )}
      {loginModal}
    </div>
  );
}

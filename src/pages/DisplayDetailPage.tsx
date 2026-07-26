import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type {
  DisplayArtworkListItemDto,
  DisplayDetailDto,
  DisplayReviewItemDto,
} from '@/api/dto';
import { ArtworkTab } from '@/components/displaydetailpage/ArtworkTab';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { DetailTabNav } from '@/components/displaydetailpage/DetailTabNav';
import { ExhibitionMeta } from '@/components/displaydetailpage/ExhibitionMeta';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { IntroTab } from '@/components/displaydetailpage/IntroTab';
import { ReviewTab } from '@/components/displaydetailpage/ReviewTab';
import {
  useDisplayArtworks,
  useDisplayDetail,
  useDisplayReviews,
} from '@/hooks/queries/useDisplayDetail';
import type { ArtworkItem, DetailTabKey, ExhibitionDetail, ReviewItem } from '@/types/exhibition';

const toExhibitionDetail = (display: DisplayDetailDto): ExhibitionDetail => {
  const posterImages = display.images
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => image.imageUrl);
  const contentImages = display.contentCategories.flatMap((category) =>
    category.contents
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((content) => content.imageUrl),
  );

  return {
    id: String(display.displayId),
    title: display.title,
    subtitle: display.subtitle ?? display.organization ?? '',
    organizer: display.organization ?? '',
    period: `${display.period.startDate} - ${display.period.endDate}`,
    hours: `${display.period.startTime} - ${display.period.endTime}`,
    location: display.location.placeName,
    bookmarkCount: display.likeCount,
    isBookmarked: false,
    heroImages: posterImages.length > 0 ? posterImages : ['https://placehold.co/400x300'],
    description: display.content ?? '',
    contentImages,
    notices: display.note ? [display.note] : [],
    host: display.organization ?? '',
    sns: display.qnaAccount,
  };
};

const toArtworkItem = (artwork: DisplayArtworkListItemDto): ArtworkItem => ({
  id: String(artwork.artworkId),
  title: artwork.artworkName,
  artist: artwork.artistName,
  thumbnail: artwork.artworkImageUrl,
  medium: 'MOCK 작품 매체',
  year: '2026',
});

const toReviewItem = (review: DisplayReviewItemDto): ReviewItem => ({
  id: String(review.displayReviewId),
  author: review.user.nickname,
  avatarColor: '#6366f1',
  rating: 5,
  content: review.content,
  date: review.createdAt,
  likes: review.likeCount,
  images: review.images.map((image) => image.imageUrl),
});

export function DisplayDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTabKey>('intro');
  const displayId = Number(id);
  const { data: display, isError, isLoading } = useDisplayDetail(displayId);
  const { data: artworksData } = useDisplayArtworks(displayId);
  const { data: reviewsData } = useDisplayReviews(displayId);

  const exhibition = display ? toExhibitionDetail(display) : undefined;
  const artworks = artworksData?.artworks.map(toArtworkItem) ?? [];
  const reviews = reviewsData?.reviews.map(toReviewItem) ?? [];

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#F0F0F3]">
        <p className="text-neutral-500 text-sm font-[Pretendard,sans-serif]">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !exhibition) {
    return (
      <div className="w-full max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#F0F0F3]">
        <p className="text-neutral-500 text-sm font-[Pretendard,sans-serif]">
          전시 정보를 찾을 수 없습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-neutral-400 underline font-[Pretendard,sans-serif]"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-bg relative">
      <HeroSlider images={exhibition.heroImages} onBack={() => navigate(-1)} />
      <ExhibitionMeta exhibition={exhibition} />
      <DetailTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'intro' && <IntroTab exhibition={exhibition} />}
      {activeTab === 'artwork' && <ArtworkTab artworks={artworks} />}
      {activeTab === 'review' && <ReviewTab reviews={reviews} />}
      <BottomFixedBar />
    </div>
  );
}
